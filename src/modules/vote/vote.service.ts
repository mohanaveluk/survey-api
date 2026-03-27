import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Vote } from "./entity/vote.entity";
import { PartyMaster } from "../party/entity/party.entity";
import { Survey, SurveyStatus } from "../survey/entity/survey.entity";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { SurveyVoteSummaryDto, VoteSummaryDto } from "./dto/vote-summary.dto";
import { TempVote } from "./entity/temp-vote.entity";
import { ResendCodeDto, TempVoteResponseDto, VerifyVoteDto } from "./dto/verify-vote.dto";
import { CustomLoggerService } from "../logger/custom-logger.service";
import { EmailService } from "src/shared/email/email.service";
import { verifyEmailTemplateForCode } from "src/shared/email/templates/verify-email-template";
import { Log } from "../logger/entity/log.entity";
import { voteOtpEmailTemplate } from "src/shared/email/templates/otc-email-templates";

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(TempVote)
    private tempVoteRepository: Repository<TempVote>,      
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(PartyMaster)
    private partyRepository: Repository<PartyMaster>,
    private emailService: EmailService,
    private logger: CustomLoggerService
  ) {}

  async create(createVoteDto: CreateVoteDto, domain: string): Promise<TempVoteResponseDto> {
    try {
      // Check if temp vote with same ID already exists
      // const existingTempVote = await this.tempVoteRepository.findOne({
      //   where: { id: createVoteDto.id }
      // });
      
      // if (existingTempVote) {
      //   throw new ConflictException(`Temporary vote with ID '${createVoteDto.id}' already exists`);
      // }

      // Verify survey exists and is active
      const survey = await this.surveyRepository.findOne({
        where: { id: createVoteDto.surveyId }
      });
      if (!survey) {
        throw new NotFoundException(`Survey with ID '${createVoteDto.surveyId}' not found`);
      }
      if (!survey.isActive) {
        throw new BadRequestException(`Survey '${survey.name}' is not active and cannot accept votes`);
      }

      // Verify party exists
      const party = await this.partyRepository.findOne({
        where: { id: createVoteDto.partyId }
      });
      if (!party) {
        throw new NotFoundException(`Party with ID '${createVoteDto.partyId}' not found`);
      }

      // Check if this voter has already voted in this survey
      const existingVote = await this.voteRepository.findOne({
        where: { 
          voterEmail: createVoteDto.voterEmail,
          surveyId: createVoteDto.surveyId
        }
      });
      
      if (existingVote) {
        throw new ConflictException(
          `Voter '${createVoteDto.voterEmail}' has already voted in survey '${survey.name}'`
        );
      }

      // Check if voter has pending temp vote for this survey
      const existingTempVoteByEmail = await this.tempVoteRepository.findOne({
        where: { 
          voterEmail: createVoteDto.voterEmail,
          surveyId: createVoteDto.surveyId,
          verified: false
        },
        relations: ['survey', 'party']
      });
      
      /*if (existingTempVoteByEmail) {
        throw new ConflictException(
          `Voter '${createVoteDto.voterEmail}' already has a pending verification for survey '${survey.name}'`
        );
      }*/

      // Generate 6-digit verification code
      const verificationCode = this.generateVerificationCode();
      
      // Set expiry time (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      let savedTempVote: TempVote;
      if (existingTempVoteByEmail) {

        // Update existing temp vote with new verification code and expiry
        existingTempVoteByEmail.verificationCode = verificationCode;
        existingTempVoteByEmail.expiresAt = expiresAt;
        existingTempVoteByEmail.gender = createVoteDto.gender;
        existingTempVoteByEmail.age = createVoteDto.age;
        existingTempVoteByEmail.location = createVoteDto.location;
        existingTempVoteByEmail.partyId = createVoteDto.partyId;
        savedTempVote = await this.tempVoteRepository.save(existingTempVoteByEmail);

      }
      else {
        const tempVoteData = {
          //id: createVoteDto.id,
          voterEmail: createVoteDto.voterEmail,
          surveyId: createVoteDto.surveyId,
          partyId: createVoteDto.partyId,
          gender: createVoteDto.gender,
          age: createVoteDto.age,
          location: createVoteDto.location,
          verificationCode,
          expiresAt,
          verified: false,
          survey: survey,
          party: party
        };

        const tempVote = this.tempVoteRepository.create(tempVoteData);
        savedTempVote = await this.tempVoteRepository.save(tempVote);
      }

      // Send verification email
      this.logger.debug('Sending email...');
      await this.emailService.sendEmail({
        to: createVoteDto.voterEmail,
        subject: 'Verify Your Email Address',
        html: voteOtpEmailTemplate({otp: verificationCode, surveyName: savedTempVote.survey.name, partyName: savedTempVote.party.name, voterEmail: createVoteDto.voterEmail, domain, expiresInMinutes: 30}),
      });
      this.logger.debug('Email has been sent');

      return {
        tempVoteId: savedTempVote.id,
        verificationCode: savedTempVote.verificationCode,
        voterEmail: savedTempVote.voterEmail,
        surveyId: savedTempVote.surveyId,
        partyId: savedTempVote.partyId,
        expiresAt: savedTempVote.expiresAt,
        message: existingTempVoteByEmail ? "A new 6-digit verification code has been generated. Please enter it to confirm your vote" :"A 6-digit verification code has been generated. Please enter it to confirm your vote"
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid data provided for vote creation');
      }
      throw new BadRequestException('Failed to create temporary vote');
    }
  }

  async verifyVote(verifyVoteDto: VerifyVoteDto): Promise<Vote> {
    try {
      // Find the temporary vote
      const tempVote = await this.tempVoteRepository.findOne({
        where: {
          id: verifyVoteDto.tempVoteId,
          voterEmail: verifyVoteDto.voterEmail,
          surveyId: verifyVoteDto.surveyId,
          verificationCode: verifyVoteDto.verificationCode,
          verified: false
        },
        relations: ['survey', 'party']
      });

      if (!tempVote) {
        throw new NotFoundException('Invalid verification code or user detail not found');
      }

      // Check if verification code has expired
      if (new Date() > tempVote.expiresAt) {
        // Remove expired temp vote
        await this.tempVoteRepository.remove(tempVote);
        throw new BadRequestException('Verification code has expired. Please try voting again.');
      }

      // Double-check that voter hasn't already voted in this survey
      const existingVote = await this.voteRepository.findOne({
        where: { 
          voterEmail: tempVote.voterEmail,
          surveyId: tempVote.surveyId
        }
      });
      
      if (existingVote) {
        throw new ConflictException(
          `Voter '${tempVote.voterEmail}' has already voted in this survey`
        );
      }

      // Create the actual vote from temp vote data
      const voteData = {
        id: `VOTE_${tempVote.id}`, // Generate new ID for actual vote
        voterEmail: tempVote.voterEmail,
        surveyId: tempVote.surveyId,
        partyId: tempVote.partyId,
        gender: tempVote.gender,
        age: tempVote.age,
        location: tempVote.location,
        votedAt: new Date(),
        survey: tempVote.survey,
        party: tempVote.party
      };

      const vote = this.voteRepository.create(voteData);
      const savedVote = await this.voteRepository.save(vote);

      // Update survey total votes
      await this.surveyRepository.increment(
        { id: tempVote.surveyId },
        'totalVotes',
        1
      );

      // Mark temp vote as verified and remove it
      await this.tempVoteRepository.remove(tempVote);

      return savedVote;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid data provided for vote verification');
      }
      throw new BadRequestException('Failed to verify and create vote');
    }
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async cleanupExpiredTempVotes(): Promise<void> {
    // Clean up expired temporary votes
    await this.tempVoteRepository
      .createQueryBuilder()
      .delete()
      .from(TempVote)
      .where("expiresAt < :now", { now: new Date() })
      .execute();
  }

  async resendCode(resendCodeDto: ResendCodeDto, domain): Promise<TempVoteResponseDto> {
    try {

      // Find the temporary vote
      const existingTempVoteByEmail = await this.tempVoteRepository.findOne({
        where: {
          //id: eesendCodeDto.tempVoteId,
          voterEmail: resendCodeDto.voterEmail,
          surveyId: resendCodeDto.surveyId,
          verified: false
        },
        relations: ['survey', 'party']
      });

      if (!existingTempVoteByEmail) {
        throw new NotFoundException('Invalid survey or email Id or temporary vote not found');
      }


      // Check if this voter has already voted in this survey
      const existingVote = await this.voteRepository.findOne({
        where: {
          voterEmail: resendCodeDto.voterEmail,
          surveyId: resendCodeDto.surveyId,

        }
      });

      if (existingVote) {
        throw new ConflictException(
          `Voter '${resendCodeDto.voterEmail}' has already voted for  survey '${resendCodeDto.surveyId}'`
        );
      }

      // Generate 6-digit verification code
      const verificationCode = this.generateVerificationCode();

      // Set expiry time (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Update existing temp vote with new verification code and expiry
      existingTempVoteByEmail.verificationCode = verificationCode;
      existingTempVoteByEmail.expiresAt = expiresAt;
      const savedTempVote = await this.tempVoteRepository.save(existingTempVoteByEmail);

      // Send verification email
      this.logger.debug('Sending email...');
      await this.emailService.sendEmail({
        to: resendCodeDto.voterEmail,
        subject: 'Verify Your Email Address',
        html: voteOtpEmailTemplate({otp: verificationCode, surveyName: savedTempVote.survey.name, partyName: savedTempVote.party.name, voterEmail: resendCodeDto.voterEmail, domain, expiresInMinutes: 30}),

      });
      this.logger.debug('Email has been sent');

      return {
        tempVoteId: savedTempVote.id,
        verificationCode: savedTempVote.verificationCode,
        voterEmail: savedTempVote.voterEmail,
        surveyId: savedTempVote.surveyId,
        partyId: savedTempVote.partyId,
        expiresAt: savedTempVote.expiresAt,
        message: existingTempVoteByEmail ? "A new 6-digit verification code has been generated. Please enter it to confirm your vote" : "A 6-digit verification code has been generated. Please enter it to confirm your vote"
      };

    }
    catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid data provided to resend verification code');
      }
      throw new BadRequestException('Failed to verify and create vote');
    }
  }

  async create_old(createVoteDto: CreateVoteDto): Promise<Vote> {
    try {
      // Check if vote with same ID already exists
      // const existingVote = await this.voteRepository.findOne({
      //   where: { id: createVoteDto.id },
      // });

      // if (existingVote) {
      //   throw new ConflictException(
      //     `Vote with ID '${createVoteDto.id}' already exists`
      //   );
      // }

      // Verify survey exists and is active
      const survey = await this.surveyRepository.findOne({
        where: { id: createVoteDto.surveyId },
      });
      if (!survey) {
        throw new NotFoundException(
          `Survey with ID '${createVoteDto.surveyId}' not found`
        );
      }
      if (!survey.isActive) {
        throw new BadRequestException(
          `Survey '${survey.name}' is not active and cannot accept votes`
        );
      }

      // Verify survey is within voting period
      const now = new Date();
      if (survey.startDate && now < survey.startDate) {
        throw new BadRequestException(
          `Voting for survey '${survey.name}' has not started yet`
        );
      }
      if (survey.endDate && now > survey.endDate) {
        throw new BadRequestException(
          `Voting for survey '${survey.name}' has ended`
        );
      }

      //verify if survey is closed
      if (survey.status === SurveyStatus.CLOSED) {
        throw new BadRequestException(
          `Survey '${survey.name}' is closed and cannot accept votes`
        );
      }

      // verify surve is in PUBLISHED status
      if (survey.status !== SurveyStatus.PUBLISHED) {
        throw new BadRequestException(
          `Survey '${survey.name}' is not published and cannot accept votes`
        );
      }

      // Verify party exists
      const party = await this.partyRepository.findOne({
        where: { id: createVoteDto.partyId },
      });
      if (!party) {
        throw new NotFoundException(
          `Party with ID '${createVoteDto.partyId}' not found`
        );
      }

      // Check if this voter has already voted in this survey
      const existingVoteByEmail = await this.voteRepository.findOne({
        where: {
          voterEmail: createVoteDto.voterEmail,
          survey: { id: createVoteDto.surveyId },
        },
      });

      if (existingVoteByEmail) {
        throw new ConflictException(
          `Voter '${createVoteDto.voterEmail}' has already voted in survey '${survey.name}'`
        );
      }

      const voteData = {
        ...createVoteDto,
        votedAt: new Date(),
        survey: survey,
        party: party,
      };

      const vote = this.voteRepository.create(voteData);
      const savedVote = await this.voteRepository.save(vote);

      // Update survey total votes
      await this.surveyRepository.increment(
        { id: createVoteDto.surveyId },
        'totalVotes',
        1
      );

      return savedVote;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Invalid data provided for vote creation'
        );
      }
      throw new BadRequestException('Failed to create vote');
    }
  }

  async findBySurveyId(surveyId: string): Promise<Vote[]> {
    try {
      // Verify survey exists
      const survey = await this.surveyRepository.findOne({
        where: { id: surveyId },
      });
      if (!survey) {
        throw new NotFoundException(`Survey with ID '${surveyId}' not found`);
      }

      return await this.voteRepository.find({
        where: { survey: { id: surveyId } },
        relations: ['survey', 'party'],
        order: { votedAt: 'DESC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve votes for survey');
    }
  }

  async findAll(): Promise<Vote[]> {
    try {
      return await this.voteRepository.find({
        relations: ['survey', 'party'],
        order: { votedAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve votes');
    }
  }

  async findOne(id: string): Promise<Vote> {
    try {
      const vote = await this.voteRepository.findOne({
        where: { id },
        relations: ['survey', 'party'],
      });

      if (!vote) {
        throw new NotFoundException(`Vote with ID '${id}' not found`);
      }

      return vote;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve vote');
    }
  }

  async getSurveyVotesSummary(surveyId: string): Promise<SurveyVoteSummaryDto> {
    try {
      // Verify survey exists
      const survey = await this.surveyRepository.findOne({
        where: { id: surveyId },
      });
      if (!survey) {
        throw new NotFoundException(`Survey with ID '${surveyId}' not found`);
      }

      // Get all votes for the survey with party information
      const votes = await this.voteRepository
        .createQueryBuilder('vote')
        .leftJoinAndSelect('vote.party', 'party')
        .where('vote.survey = :surveyId', { surveyId })
        .getMany();

      // Get the latest vote date
      const lastVote = await this.voteRepository
        .createQueryBuilder('vote')
        .where('vote.survey = :surveyId', { surveyId })
        .orderBy('vote.votedAt', 'DESC')
        .getOne();

      // Group votes by party
      const partyVotesMap = new Map();
      votes.forEach((vote) => {
        const partyId = vote.party.id;
        if (partyVotesMap.has(partyId)) {
          partyVotesMap.get(partyId).count++;
        } else {
          partyVotesMap.set(partyId, {
            party: vote.party,
            count: 1,
          });
        }
      });

      const totalVotes = votes.length;
      const partyVotes: VoteSummaryDto[] = Array.from(
        partyVotesMap.entries()
      ).map(([partyId, data]) => ({
        partyId,
        partyName: data.party.name,
        partyColor: data.party.color || '#000000',
        totalVotes: data.count,
        percentage: totalVotes > 0 ? (data.count / totalVotes) * 100 : 0,
      }));

      // Sort by total votes descending
      partyVotes.sort((a, b) => b.totalVotes - a.totalVotes);

      return {
        surveyId: survey.id,
        surveyName: survey.name,
        totalVotes,
        partyVotes,
        lastVoteDate: lastVote?.votedAt || null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to generate vote summary');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const vote = await this.findOne(id);

      // Decrement survey total votes
      await this.surveyRepository.decrement(
        { id: vote.survey.id },
        'totalVotes',
        1
      );

      await this.voteRepository.remove(vote);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete vote');
    }
  }

  async getVotesByEmail(email: string): Promise<Vote[]> {
    try {
      return await this.voteRepository.find({
        where: { voterEmail: email },
        relations: ['survey', 'party'],
        order: { votedAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve votes by email');
    }
  }

  async checkIfVoterHasVoted(
    surveyId: string,
    email: string
  ): Promise<boolean> {
    try {
      const vote = await this.voteRepository.findOne({
        where: {
          survey: { id: surveyId },
          voterEmail: email,
        },
      });
      return !!vote;
    } catch (error) {
      throw new BadRequestException('Failed to check voter status');
    }
  }

}