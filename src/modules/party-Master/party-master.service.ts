import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { PartyMaster } from "./entity/party-master.entity";
import { CloudStorageService } from '../../common/services/cloud-storage.service';
import { CreatePartyMasterDto } from './dto/create-party-master.dto';
import { UpdatePartyMasterDto } from './dto/update-party-master.dto';
import { User } from '../user/entity/user.entity';
@Injectable()
export class PartyMasterService {
    constructor(
        @InjectRepository(PartyMaster)
        private partyRepository: Repository<PartyMaster>,
        private readonly cloudStorageService: CloudStorageService,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async create(
        createPartyDto: CreatePartyMasterDto,
        userInfo: any,
        logoFile?: Express.Multer.File
    ): Promise<PartyMaster> {
        try {
            //verify user exists in User table before fetching parties
            const user = await this.userRepository.findOne({
                where: { uguid: userInfo.uguid },
            });

            if (!user) {
                throw new NotFoundException(`User with ID '${createPartyDto.createdBy}' not found`);
            }

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
            else if (createPartyDto.logo_url) {
                logoUrl = createPartyDto.logo_url;
            }


            const partyData = {
                name: createPartyDto.name,
                color: createPartyDto.color,
                leader_name: createPartyDto.leader_name,
                contestant_name: createPartyDto.contestant_name,
                logo_url: logoUrl || null,
                createdBy: createPartyDto.createdBy || user.uguid,
                createdAt: createPartyDto.createdAt || new Date(),
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

    async findAll(userId: string): Promise<PartyMaster[]> {
        try {

            //verify user exists in User table before fetching parties
            const user = await this.userRepository.findOne({
                where: { uguid: userId }
            });

            if (!user) {
                throw new NotFoundException(`User with ID '${userId}' not found`);
            }

            return await this.partyRepository.find({
                relations: ['country'], // Include country relation to avoid lazy loading issues,
                order: { name: 'ASC' },
            });
        } catch (error) {
            throw new BadRequestException('Failed to retrieve parties');
        }
    }

    async findOne(id: string): Promise<PartyMaster> {
        try {
            const party = await this.partyRepository.findOne({
                where: { id }
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
        updatePartyDto: UpdatePartyMasterDto,
        userInfo: any,
        logoFile?: Express.Multer.File
    ): Promise<PartyMaster> {
        try {

            //verify user exists in User table before fetching parties
            const user = await this.userRepository.findOne({
                where: { uguid: userInfo.uguid },
            }); 
            if (!user) {
                throw new NotFoundException(`User with ID '${userInfo.uguid}' not found`);
            }

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
                .where('LOWER(party.name) LIKE LOWER(:name)', { name: `%${name}%` })
                .orderBy('party.name', 'ASC')
                .getMany();
        } catch (error) {
            throw new BadRequestException('Failed to search parties by name');
        }
    }

    async getDistinctLogoUrls(userId: string): Promise<{ data: string[] }> {
        // Query: SELECT DISTINCT logo_url FROM parties
        //        WHERE user_id = $1 AND logo_url IS NOT NULL AND logo_url != ''
        //        ORDER BY logo_url ASC
        const rows = await this.partyRepository
            .createQueryBuilder('p')
            .select('DISTINCT p.logo_url', 'url')
            //.where('p.created_by = :userId', { userId })
            .where('p.logo_url IS NOT NULL')
            .andWhere("p.logo_url != ''")
            .orderBy('p.logo_url', 'ASC')
            .getRawMany<{ url: string }>();

        return { data: rows.map(r => r.url) };
    }
}