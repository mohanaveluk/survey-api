import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { PartyMaster } from "./entity/party.entity";
import { CloudStorageService } from '../../common/services/cloud-storage.service';
import { CreatePartyDto } from './dto/create-party.dto';
import { UpdatePartyDto } from './dto/update-party.dto';
@Injectable()
export class PartyService {
    constructor(
        @InjectRepository(PartyMaster)
        private partyRepository: Repository<PartyMaster>,
        private readonly cloudStorageService: CloudStorageService        
    ) { }

    async create(
        createPartyDto: CreatePartyDto,
        logoFile?: Express.Multer.File
    ): Promise<PartyMaster> {
        try {
            // Check if party with same name already exists
            const existingPartyByName = await this.partyRepository.findOne({
                where: { name: createPartyDto.name },
            });

            if (existingPartyByName) {
                throw new ConflictException(
                    `Party with name '${createPartyDto.name}' already exists`
                );
            }

            let logoUrl: string | undefined;

            // Handle logo upload if provided
            if (logoFile) {
                await this.cloudStorageService.isFileValid(logoFile);
                logoUrl = await this.cloudStorageService.uploadFile(
                    logoFile,
                    'party-logos'
                );
            }

            const partyData = {
                name: createPartyDto.name,
                color: createPartyDto.color,
                leader_name: createPartyDto.leader_name,
                logo_url: logoUrl,
            };

            const party = this.partyRepository.create(partyData);
            return await this.partyRepository.save(party);
        } catch (error) {
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            if (error instanceof QueryFailedError) {
                throw new BadRequestException(
                    'Invalid data provided for party creation'
                );
            }
            throw new BadRequestException('Failed to create party');
        }
    }

    async findAll(): Promise<PartyMaster[]> {
        try {
            return await this.partyRepository.find({
                relations: ['surveys'],
                order: { name: 'ASC' },
            });
        } catch (error) {
            throw new BadRequestException('Failed to retrieve parties');
        }
    }

    async findOne(id: string): Promise<PartyMaster> {
        try {
            const party = await this.partyRepository.findOne({
                where: { id },
                relations: ['surveys'],
            });

            if (!party) {
                throw new NotFoundException(`Party with ID '${id}' not found`);
            }

            return party;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to retrieve party');
        }
    }

    async update(
        id: string,
        updatePartyDto: UpdatePartyDto,
        logoFile?: Express.Multer.File
    ): Promise<PartyMaster> {
        try {
            const party = await this.findOne(id);

            // Check if updating name would create conflict
            if (updatePartyDto.name && updatePartyDto.name !== party.name) {
                const existingPartyByName = await this.partyRepository.findOne({
                    where: { name: updatePartyDto.name },
                });

                if (existingPartyByName && existingPartyByName.id !== id) {
                    throw new ConflictException(
                        `Party with name '${updatePartyDto.name}' already exists`
                    );
                }
            }

            let newLogoUrl: string | undefined;

            // Handle logo upload if provided
            if (logoFile) {
                await this.cloudStorageService.isFileValid(logoFile);

                // Delete old logo if it exists
                if (party.logo_url) {
                    await this.cloudStorageService.deleteFile(party.logo_url);
                }

                // Upload new logo
                newLogoUrl = await this.cloudStorageService.uploadFile(
                    logoFile,
                    'party-logos'
                );
            }

            // Create update data
            const updateData = {
                ...updatePartyDto,
                ...(newLogoUrl && { logo_url: newLogoUrl }),
            };

            Object.assign(party, updateData);
            return await this.partyRepository.save(party);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            if (error instanceof QueryFailedError) {
                throw new BadRequestException('Invalid data provided for party update');
            }
            throw new BadRequestException('Failed to update party');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const party = await this.findOne(id);

            // Check if party is associated with any surveys
            const partyWithSurveys = await this.partyRepository.findOne({
                where: { id },
                relations: ['surveys'],
            });

            if (partyWithSurveys?.surveys && partyWithSurveys.surveys.length > 0) {
                throw new ConflictException(
                    `Cannot delete party '${party.name}' as it is associated with ${partyWithSurveys.surveys.length} survey(s)`
                );
            }

            // Delete logo file if it exists
            if (party.logo_url) {
                await this.cloudStorageService.deleteFile(party.logo_url);
            }

            await this.partyRepository.remove(party);
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new BadRequestException('Failed to delete party');
        }
    }

    async findByName(name: string): Promise<PartyMaster[]> {
        try {
            return await this.partyRepository
                .createQueryBuilder('party')
                .leftJoinAndSelect('party.surveys', 'surveys')
                .where('LOWER(party.name) LIKE LOWER(:name)', { name: `%${name}%` })
                .orderBy('party.name', 'ASC')
                .getMany();
        } catch (error) {
            throw new BadRequestException('Failed to search parties by name');
        }
    }
}