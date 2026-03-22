import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { In, QueryFailedError, Repository } from "typeorm";
import { SurveyParty } from "./entity/survey-party.entity";
import { Survey } from '../survey/entity/survey.entity';
import { PartyMaster } from '../party/entity/party.entity';
import { BulkCreateSurveyPartyDto, CreateSurveyPartyDto } from './dto/create-survey-party.dto';

@Injectable()
export class SurveyPartyService {
  constructor(
    @InjectRepository(SurveyParty)
    private surveyPartyRepository: Repository<SurveyParty>,
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(PartyMaster)
    private partyRepository: Repository<PartyMaster>
  ) {}

  async create(
    createSurveyPartyDto: CreateSurveyPartyDto
  ): Promise<SurveyParty> {
    try {
      // Verify survey exists
      const survey = await this.surveyRepository.findOne({
        where: { id: createSurveyPartyDto.surveyId },
      });
      if (!survey) {
        throw new NotFoundException(
          `Survey with ID '${createSurveyPartyDto.surveyId}' not found`
        );
      }

      // Verify party exists
      const party = await this.partyRepository.findOne({
        where: { id: createSurveyPartyDto.partyId },
      });
      if (!party) {
        throw new NotFoundException(
          `Party with ID '${createSurveyPartyDto.partyId}' not found`
        );
      }

      // Check if association already exists
      const existingAssociation = await this.surveyPartyRepository
        .createQueryBuilder('sp')
        .where('sp.survey = :surveyId AND sp.party = :partyId', {
          surveyId: createSurveyPartyDto.surveyId,
          partyId: createSurveyPartyDto.partyId,
        })
        .getOne();

      if (existingAssociation) {
        throw new ConflictException(
          `Association already exists between survey '${survey.name}' and party '${party.name}'`
        );
      }

      const surveyParty = this.surveyPartyRepository.create({
        survey: survey,
        party: party,
      });

      return await this.surveyPartyRepository.save(surveyParty);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Invalid data provided for survey-party association'
        );
      }
      throw new BadRequestException(
        'Failed to create survey-party association'
      );
    }
  }

  async bulkCreate(
    bulkCreateDto: BulkCreateSurveyPartyDto
  ): Promise<SurveyParty[]> {
    try {
      // Verify survey exists
      const survey = await this.surveyRepository.findOne({
        where: { id: bulkCreateDto.surveyId },
      });
      if (!survey) {
        throw new NotFoundException(
          `Survey with ID '${bulkCreateDto.surveyId}' not found`
        );
      }

      // Verify all parties exist
      const parties = await this.partyRepository.find({
        where: { id: In(bulkCreateDto.partyIds) },
      });

      if (parties.length !== bulkCreateDto.partyIds.length) {
        const foundPartyIds = parties.map((p) => p.id);
        const missingPartyIds = bulkCreateDto.partyIds.filter(
          (id) => !foundPartyIds.includes(id)
        );
        throw new NotFoundException(
          `Parties not found: ${missingPartyIds.join(', ')}`
        );
      }

      // Check for existing associations
      const existingAssociations = await this.surveyPartyRepository
        .createQueryBuilder('sp')
        .leftJoin('sp.survey', 'survey')
        .leftJoin('sp.party', 'party')
        .where('survey.id = :surveyId AND party.id IN (:...partyIds)', {
          surveyId: bulkCreateDto.surveyId,
          partyIds: bulkCreateDto.partyIds,
        })
        .getMany();

      if (existingAssociations.length > 0) {
        throw new ConflictException(
          `Some associations already exist for survey '${survey.name}'`
        );
      }

      // Create all associations
      const surveyParties = parties.map((party) =>
        this.surveyPartyRepository.create({
          survey: survey,
          party: party,
        })
      );

      return await this.surveyPartyRepository.save(surveyParties);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create bulk survey-party associations'
      );
    }
  }

  async findAll(): Promise<SurveyParty[]> {
    try {
      return await this.surveyPartyRepository.find({
        relations: ['survey', 'party'],
        order: { id: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve survey-party associations'
      );
    }
  }

  async findBySurvey(surveyId: string): Promise<SurveyParty[]> {
    try {
      // Verify survey exists
      const survey = await this.surveyRepository.findOne({
        where: { id: surveyId },
      });
      if (!survey) {
        throw new NotFoundException(`Survey with ID '${surveyId}' not found`);
      }

      return await this.surveyPartyRepository.find({
        where: { survey: { id: surveyId } },
        relations: ['party'],
        order: { id: 'ASC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve survey parties');
    }
  }

  async findByParty(partyId: string): Promise<SurveyParty[]> {
    try {
      // Verify party exists
      const party = await this.partyRepository.findOne({
        where: { id: partyId },
      });
      if (!party) {
        throw new NotFoundException(`Party with ID '${partyId}' not found`);
      }

      return await this.surveyPartyRepository.find({
        where: { party: { id: partyId } },
        relations: ['survey'],
        order: { id: 'ASC' },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve party surveys');
    }
  }

  async findOne(id: string): Promise<SurveyParty> {
    try {
      const surveyParty = await this.surveyPartyRepository.findOne({
        where: { id },
        relations: ['survey', 'party'],
      });

      if (!surveyParty) {
        throw new NotFoundException(
          `Survey-Party association with ID '${id}' not found`
        );
      }

      return surveyParty;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to retrieve survey-party association'
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const surveyParty = await this.findOne(id);
      await this.surveyPartyRepository.remove(surveyParty);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to delete survey-party association'
      );
    }
  }

  async removeBySurveyAndParty(
    surveyId: string,
    partyId: string
  ): Promise<void> {
    try {
      const surveyParty = await this.surveyPartyRepository
        .createQueryBuilder('sp')
        .leftJoin('sp.survey', 'survey')
        .leftJoin('sp.party', 'party')
        .where('survey.id = :surveyId AND party.id = :partyId', {
          surveyId,
          partyId,
        })
        .getOne();

      if (!surveyParty) {
        throw new NotFoundException(
          `Association between survey '${surveyId}' and party '${partyId}' not found`
        );
      }

      await this.surveyPartyRepository.remove(surveyParty);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to delete survey-party association'
      );
    }
  }

  async removeAllBySurvey(surveyId: string): Promise<number> {
    try {
      // Verify survey exists
      const survey = await this.surveyRepository.findOne({
        where: { id: surveyId },
      });
      if (!survey) {
        throw new NotFoundException(`Survey with ID '${surveyId}' not found`);
      }

      const result = await this.surveyPartyRepository
        .createQueryBuilder()
        .delete()
        .from(SurveyParty)
        .where('survey.id = :surveyId', { surveyId })
        .execute();

      return result.affected || 0;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to remove all party associations for survey'
      );
    }
  }
}