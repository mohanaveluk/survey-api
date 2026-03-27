import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, QueryFailedError, Repository } from "typeorm";
import { Survey, SurveyStatus } from "./entity/survey.entity";
import { User } from "../user/entity/user.entity";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { PublishSurveyDto, UpdateSurveyDto } from "./dto/update-survey.dto";
import { SurveyParty } from "../survey-party/entity/survey-party.entity";
import { PartyMaster } from "../party/entity/party.entity";

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SurveyParty)
    private surveyPartyRepository: Repository<SurveyParty>,
    @InjectRepository(PartyMaster)
    private partyRepository: Repository<PartyMaster>    

  ) {}

async create(createSurveyDto: CreateSurveyDto, user?: User): Promise<Survey> {
    try {
      const { partyIds, ...surveyData } = createSurveyDto;

      // Check if survey with same ID already exists
      const existingSurvey = await this.surveyRepository.findOne({
        where: { id: surveyData.id },
      });

      if (existingSurvey) {
        throw new ConflictException(
          `Survey with ID '${surveyData.id}' already exists`
        );
      }

      // Check if survey with same name already exists
      const existingSurveyByName = await this.surveyRepository.findOne({
        where: { name: surveyData.name },
      });

      if (existingSurveyByName) {
        throw new ConflictException(
          `Survey with name '${surveyData.name}' already exists`
        );
      }

      // Validate creator if provided
      let creator: User | undefined;
      if (surveyData.createdBy) {
        creator = await this.userRepository.findOne({
          where: { uguid: surveyData.createdBy },
        });
        if (!creator) {
          throw new NotFoundException(
            `User with ID '${surveyData.createdBy}' not found`
          );
        }
      } else if (user) {
        creator = user;
      }

      // Validate party IDs if provided
      if (partyIds && partyIds.length > 0) {
        const parties = await this.partyRepository.find({
          where: { id: In(partyIds) as any },
        });

        if (parties.length !== partyIds.length) {
          const foundIds = parties.map((p) => p.id);
          const missingIds = partyIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `Parties not found: ${missingIds.join(', ')}`
          );
        }
      }

      // Validate date range
      if (surveyData.startDate && surveyData.endDate) {
        const startDate = new Date(surveyData.startDate);
        const endDate = new Date(surveyData.endDate);
        if (startDate >= endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
      }

      const newSurveyData = {
        id: surveyData.id,
        name: surveyData.name,
        description: surveyData.description,
        createdBy: surveyData.createdBy || creator?.email,
        isActive: surveyData.isActive ?? true,
        totalVotes: surveyData.totalVotes ?? 0,
        status: surveyData.status ?? SurveyStatus.DRAFT,
        startDate: surveyData.startDate ? new Date(surveyData.startDate) : null,
        endDate: surveyData.endDate ? new Date(surveyData.endDate) : null,
        isAnonymous: surveyData.isAnonymous ?? true,
        creator: creator,
      };

      const survey = this.surveyRepository.create(newSurveyData);
      const savedSurvey = await this.surveyRepository.save(survey);

      // Handle party associations if partyIds are provided
      if (partyIds && partyIds.length > 0) {
        await this.updateSurveyParties(savedSurvey.id, partyIds);
      }

      // Return survey with relations
      return await this.surveyRepository.findOne({
        where: { id: savedSurvey.id },
        relations: ['surveyParties', 'surveyParties.party', 'creator'],
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Invalid data provided for survey creation'
        );
      }
      throw new BadRequestException('Failed to create survey');
    }
  }

  async findAll(): Promise<Survey[]> {
    try {
      return await this.surveyRepository.find({
        relations: ['surveyParties', 'surveyParties.party', 'creator', 'votes'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve surveys');
    }
  }

  async findActive(): Promise<Survey[]> {
    try {
      return await this.surveyRepository.find({
        where: { isActive: true },
        relations: ['surveyParties', 'surveyParties.party', 'creator'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve active surveys');
    }
  }

  async findByStatus(status: SurveyStatus): Promise<Survey[]> {
    try {
      return await this.surveyRepository.find({
        where: { status },
        relations: ['surveyParties', 'surveyParties.party', 'creator'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve ${status.toLowerCase()} surveys`
      );
    }
  }

  async findOne(id: string): Promise<Survey> {
    try {
      const survey = await this.surveyRepository.findOne({
        where: { id },
        relations: ['surveyParties', 'surveyParties.party', 'creator', 'votes'],
      });

      if (!survey) {
        throw new NotFoundException(`Survey with ID '${id}' not found`);
      }

      return survey;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve survey');
    }
  }

  //create a method to find survey by userId without relations (for internal use)
  async findByUserId(userId: string): Promise<Survey[]> {
    try {

      const user = await this.userRepository.findOne({
        where: { uguid: userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID '${userId}' not found`);
      }

      return await this.surveyRepository.find({
        where: { createdBy: user.uguid },
        relations: ['surveyParties', 'surveyParties.party', 'creator', 'votes'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve surveys');
    }
  }

  async update(
    id: string,
    updateSurveyDto: UpdateSurveyDto,
    user?: User
  ): Promise<Survey> {
    try {
      const survey = await this.findOne(id);

      // Check if survey is still in DRAFT status
      if (survey.status !== SurveyStatus.DRAFT) {
        throw new ForbiddenException(
          `Cannot update survey with status '${survey.status}'. Only DRAFT surveys can be updated.`
        );
      }

      // Check if user has permission to update (if user context is provided)
      if (user && survey.creator && survey.creator.uguid !== user.uguid) {
        throw new ForbiddenException(
          'You can only update surveys that you created'
        );
      }

      const { partyIds, ...surveyData } = updateSurveyDto;

      // Check if updating name would create conflict
      if (surveyData.name && surveyData.name !== survey.name) {
        const existingSurveyByName = await this.surveyRepository.findOne({
          where: { name: surveyData.name },
        });

        if (existingSurveyByName && existingSurveyByName.id !== id) {
          throw new ConflictException(
            `Survey with name '${surveyData.name}' already exists`
          );
        }
      }

      // Validate creator if being updated
      if (surveyData.createdBy) {
        const creator = await this.userRepository.findOne({
          where: { uguid: surveyData.createdBy },
        });
        if (!creator) {
          throw new NotFoundException(
            `User with ID '${surveyData.createdBy}' not found`
          );
        }
      }

      // Validate party IDs if provided
      if (partyIds && partyIds.length > 0) {
        const parties = await this.partyRepository.find({
          where: { id: In(partyIds) as any },
        });

        if (parties.length !== partyIds.length) {
          const foundIds = parties.map((p) => p.id);
          const missingIds = partyIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `Parties not found: ${missingIds.join(', ')}`
          );
        }
      }

      // Validate date range if being updated
      const startDate = surveyData.startDate
        ? new Date(surveyData.startDate)
        : survey.startDate;
      const endDate = surveyData.endDate
        ? new Date(surveyData.endDate)
        : survey.endDate;

      if (startDate && endDate && startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Prepare update data
      const updateData: any = {};
      if (surveyData.name) updateData.name = surveyData.name;
      if (surveyData.description !== undefined)
        updateData.description = surveyData.description;
      if (surveyData.createdBy !== undefined)
        updateData.createdBy = surveyData.createdBy;
      if (surveyData.isActive !== undefined)
        updateData.isActive = surveyData.isActive;
      if (surveyData.totalVotes !== undefined)
        updateData.totalVotes = surveyData.totalVotes;
      if (surveyData.startDate !== undefined) updateData.startDate = startDate;
      if (surveyData.endDate !== undefined) updateData.endDate = endDate;
      if (surveyData.isAnonymous !== undefined)
        updateData.isAnonymous = surveyData.isAnonymous;

      if (surveyData.createdBy) {
        const creator = await this.userRepository.findOne({
          where: { uguid: surveyData.createdBy },
        });
        updateData.creator = creator;
      }

      Object.assign(survey, updateData);
      const updatedSurvey = await this.surveyRepository.save(survey);

      // Handle party associations if partyIds are provided
      if (partyIds !== undefined) {
        await this.updateSurveyParties(id, partyIds || []);
      }

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Invalid data provided for survey update'
        );
      }
      throw new BadRequestException('Failed to update survey');
    }
  }

  async publishSurvey(
    id: string,
    publishDto?: PublishSurveyDto,
    user?: User
  ): Promise<Survey> {
    try {
      const survey = await this.findOne(id);

      // Check if user has permission to publish (if user context is provided)
      if (user && survey.creator && survey.creator.uguid !== user.uguid.toString()) {
        throw new ForbiddenException(
          'You can only publish surveys that you created'
        );
      }

      // Can only publish DRAFT surveys
      if (survey.status !== SurveyStatus.DRAFT) {
        throw new ForbiddenException(
          `Cannot change status from '${survey.status}'. Only DRAFT surveys can be published.`
        );
      }

      // Validate survey is ready for publishing
      if (!survey.name || survey.name.trim() === '') {
        throw new BadRequestException(
          'Survey must have a name before publishing'
        );
      }

      // Check if survey has parties associated (optional validation)
      const surveyWithParties = await this.surveyRepository.findOne({
        where: { id },
        relations: ['surveyParties'],
      });

      if (
        !surveyWithParties?.surveyParties ||
        surveyWithParties.surveyParties.length === 0
      ) {
        throw new BadRequestException(
          'Survey must have at least one party before publishing'
        );
      }

      // Validate dates if provided
      if (
        survey.startDate &&
        survey.endDate &&
        survey.startDate >= survey.endDate
      ) {
        throw new BadRequestException('Start date must be before end date');
      }

      // Set status to PUBLISHED or the provided status
      const newStatus = publishDto?.status ?? SurveyStatus.PUBLISHED;

      // Validate status transition
      if (
        newStatus !== SurveyStatus.PUBLISHED &&
        newStatus !== SurveyStatus.CLOSED
      ) {
        throw new BadRequestException(
          'Can only publish to PUBLISHED or CLOSED status'
        );
      }

      survey.status = newStatus;

      // Set start date to now if not specified and publishing
      if (newStatus === SurveyStatus.PUBLISHED && !survey.startDate) {
        survey.startDate = new Date();
      }

      return await this.surveyRepository.save(survey);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to publish survey');
    }
  }


  async closeSurvey(
    id: string,
    publishDto?: PublishSurveyDto,
    user?: User
  ): Promise<Survey> {
    try {
      const survey = await this.findOne(id);

      // Check if user has permission to publish (if user context is provided)
      if (user && survey.creator && survey.creator.uguid !== user.uguid.toString()) {
        throw new ForbiddenException(
          'You can only publish surveys that you created'
        );
      }

      // Can only close DRAFT or PUBLISHED surveys
      if (survey.status !== SurveyStatus.DRAFT && survey.status !== SurveyStatus.PUBLISHED) {
        throw new ForbiddenException(
          `Cannot change status from '${survey.status}'. Only DRAFT and PUBLISHED surveys can be closed.`
        );
      }


      // Check if survey has parties associated (optional validation)
      const surveyWithParties = await this.surveyRepository.findOne({
        where: { id },
        relations: ['surveyParties'],
      });

      if (
        !surveyWithParties?.surveyParties ||
        surveyWithParties.surveyParties.length === 0
      ) {
        throw new BadRequestException(
          'Survey must have at least one party before closing'
        );
      }

      // Set status to CLOSED or the provided status
      const newStatus = publishDto?.status ?? SurveyStatus.CLOSED;

      // Validate status transition
      if (
        newStatus !== SurveyStatus.PUBLISHED &&
        newStatus !== SurveyStatus.CLOSED
      ) {
        throw new BadRequestException(
          'Can only close to PUBLISHED or CLOSED status'
        );
      }

      survey.status = newStatus;

      // Set start date to now if not specified and publishing
      if (newStatus === SurveyStatus.PUBLISHED && !survey.startDate) {
        survey.startDate = new Date();
      }

      return await this.surveyRepository.save(survey);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to close survey');
    }
  }


  async remove(id: string): Promise<void> {
    try {
      const survey = await this.findOne(id);

      // Check if survey has any associated parties
      const surveyWithParties = await this.surveyRepository.findOne({
        where: { id },
        relations: ['surveyParties'],
      });

      if (surveyWithParties?.surveyParties && surveyWithParties.surveyParties.length > 0) {
        throw new ConflictException(
          `Cannot delete survey '${survey.name}' as it has ${surveyWithParties.surveyParties.length} associated parties. Please remove party associations first.`
        );
      }

      await this.surveyRepository.remove(survey);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete survey');
    }
  }

  async findByName(name: string): Promise<Survey[]> {
    try {
      return await this.surveyRepository
        .createQueryBuilder('survey')
        .leftJoinAndSelect('survey.parties', 'surveyParty')
        .leftJoinAndSelect('surveyParty.party', 'party')
        .leftJoinAndSelect('survey.creator', 'creator')
        .where('LOWER(survey.name) LIKE LOWER(:name)', { name: `%${name}%` })
        .orderBy('survey.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw new BadRequestException('Failed to search surveys by name');
    }
  }

  async updateVoteCount(id: string, increment = 1): Promise<Survey> {
    try {
      const survey = await this.findOne(id);
      survey.totalVotes += increment;
      return await this.surveyRepository.save(survey);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update vote count');
    }
  }

  async toggleActive(id: string): Promise<Survey> {
    try {
      const survey = await this.findOne(id);
      survey.isActive = !survey.isActive;
      return await this.surveyRepository.save(survey);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle survey status');
    }
  }


  /**
   * Update party associations for a survey
   */
  private async updateSurveyParties(
    surveyId: string,
    partyIds: string[]
  ): Promise<void> {
    try {

      //find all existing partyIds for the survey
      const existingSurveyParties = await this.surveyPartyRepository.find({
        where: { survey: { id: surveyId } },
        relations: ['party'],
      });

      //remove all existing associations that are not in the new partyIds list
      if (existingSurveyParties.length > 0) {
        await this.surveyPartyRepository.remove(existingSurveyParties);
      }

      // Remove existing party associations
      //await this.surveyPartyRepository.delete({ survey: { id: surveyId } });

      // Add new party associations
      if (partyIds.length > 0) {
        const surveyParties = partyIds.map((partyId) =>
          this.surveyPartyRepository.create({
            survey: { id: surveyId } as Survey,
            party: { id: partyId } as PartyMaster,
          })
        );

        await this.surveyPartyRepository.save(surveyParties);
      }
    } catch (error) {
      throw new BadRequestException(
        'Failed to update survey party associations'
      );
    }
  }

  /**
   * Update party IDs for an existing survey
   */
  async updateSurveyPartyIds(
    surveyId: string,
    partyIds: string[],
    user?: User
  ): Promise<Survey> {
    try {
      // Verify survey exists and user has permission
      const survey = await this.findOne(surveyId);

      if (user && survey.creator && survey.creator.id !== user.id) {
        throw new ForbiddenException(
          'You can only update surveys that you created'
        );
      }

      // Check if survey is still in DRAFT status
      if (survey.status !== SurveyStatus.DRAFT) {
        throw new ForbiddenException(
          `Cannot update survey with status '${survey.status}'. Only DRAFT surveys can be updated.`
        );
      }

      // Validate party IDs
      if (partyIds.length > 0) {
        const parties = await this.partyRepository.find({
          where: { id: partyIds as any },
        });

        if (parties.length !== partyIds.length) {
          const foundIds = parties.map((p) => p.id);
          const missingIds = partyIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `Parties not found: ${missingIds.join(', ')}`
          );
        }
      }

      await this.updateSurveyParties(surveyId, partyIds);

      return await this.findOne(surveyId);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update survey party associations'
      );
    }
  }

}