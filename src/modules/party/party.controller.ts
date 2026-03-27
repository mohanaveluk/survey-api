import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
} from '@nestjs/swagger';
import { PartyService } from './party.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePartyDto } from './dto/create-party.dto';
import { PartyMaster } from './entity/party.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdatePartyDto } from './dto/update-party.dto';

@ApiTags('Party')
@Controller('party')
export class PartyController {
    constructor(
        private readonly partyService: PartyService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('logo'))
    @ApiOperation({
        summary: 'Create a new party',
        description:
            'Creates a new political party with name, optional logo image, leader name, and color. Logo will be uploaded to Google Cloud Storage.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Party data with optional logo image',
        type: CreatePartyDto,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Party created successfully with logo URL',
        type: ResponseDto<PartyMaster>,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Party with this name already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or invalid image file',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    async create(
        @Body() createPartyDto: CreatePartyDto,
        @UploadedFile() logoFile?: Express.Multer.File
    ): Promise<ResponseDto<PartyMaster>> {
        const party = await this.partyService.create(createPartyDto, logoFile);
        const message = logoFile
            ? 'Party created successfully with logo uploaded'
            : 'Party created successfully';
        return ResponseDto.created(party, message);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all parties',
        description: 'Retrieves a list of all political parties ordered by name',
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search parties by name (case-insensitive partial match)'
        
    })
    @ApiQuery({
        name: 'userId',
        required: false,
        description: 'ID of the user who created the parties',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Parties retrieved successfully',
        type: ResponseDto<PartyMaster[]>,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Failed to retrieve parties',
    })
    async findAll(
        @Query('search') search?: string,
        @Query('userId') userId?: string
    ): Promise<ResponseDto<PartyMaster[]>> {
        const parties = search
            ? await this.partyService.findByName(search)
            : await this.partyService.findAll(userId);

        const message = search
            ? `Found ${parties.length} parties matching '${search}'`
            : `Retrieved ${parties.length} parties`;

        return ResponseDto.success(parties, message);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get party by ID',
        description:
            'Retrieves a specific party by its unique identifier including related surveys',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the party',
        example: 'PARTY001',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Party retrieved successfully',
        type: ResponseDto<PartyMaster>,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Party not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid party ID format',
    })
    async findOne(@Param('id') id: string): Promise<ResponseDto<PartyMaster>> {
        const party = await this.partyService.findOne(id);
        return ResponseDto.success(party, 'Party retrieved successfully');
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('logo'))
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update party',
        description:
            "Updates an existing party's information (name, color, leader name, logo image). If logo is provided, old logo will be replaced.",
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the party to update',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Updated party data with optional logo image',
        type: UpdatePartyDto,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Party updated successfully with logo URL',
        type: ResponseDto<PartyMaster>,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Party not found',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Party name already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data or invalid image file',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    async update(
        @Param('id') id: string,
        @Body() updatePartyDto: UpdatePartyDto,
        @UploadedFile() logoFile?: Express.Multer.File
    ): Promise<ResponseDto<PartyMaster>> {
        const party = await this.partyService.update(id, updatePartyDto, logoFile);
        const message = logoFile
            ? 'Party updated successfully with logo uploaded'
            : 'Party updated successfully';
        return ResponseDto.updated(party, message);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Delete party',
        description: 'Deletes a party if it is not associated with any surveys',
    })
    @ApiParam({
        name: 'id',
        description: 'Unique identifier of the party to delete',
        example: 'PARTY001',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Party deleted successfully',
        type: ResponseDto<null>,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Party not found',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Cannot delete party associated with surveys',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Failed to delete party',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
        await this.partyService.remove(id);
        return ResponseDto.deleted('Party deleted successfully');
    }
}