import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Vote } from "./entity/vote.entity";
import { PartyMaster } from "../party/entity/party.entity";
import { Survey, SurveyStatus } from "../survey/entity/survey.entity";
import { CreateVoteDto } from "./dto/create-vote.dto";
import { SurveyVoteSummaryDto, VoteSummaryDto } from "./dto/vote-summary.dto";

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(PartyMaster)
    private partyRepository: Repository<PartyMaster>
  ) {}

  async create(createVoteDto: CreateVoteDto): Promise<Vote> {
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