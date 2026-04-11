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
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Request,
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
import { PartyMasterService } from './party-master.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePartyMasterDto } from './dto/create-party-master.dto';
import { PartyMaster } from './entity/party-master.entity';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UpdatePartyMasterDto } from './dto/update-party-master.dto';
import { maxFileSize } from 'src/shared/utils/file-validation.util';

@ApiTags('Party Master')
@Controller('party_master')
export class PartyMasterController {
    constructor(
        private readonly partyService: PartyMasterService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({
        summary: 'Create a new party',
        description:
            'Creates a new political party with name, optional logo image, leader name, and color. Logo will be uploaded to Google Cloud Storage.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Party data with optional logo image',
        type: CreatePartyMasterDto,
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
        @Body() createPartyDto: CreatePartyMasterDto,
        @Request() req,
        @UploadedFile(
              new ParseFilePipe({
                validators: [
                  new MaxFileSizeValidator({ maxSize: maxFileSize }),
                  new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                ],
                fileIsRequired: false,
              }),
            ) file?: Express.Multer.File,
    ): Promise<ResponseDto<PartyMaster>> {
        const party = await this.partyService.create(createPartyDto, req.user, file );
        const message = file
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

    @Get('logos')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')    
    @ApiOperation({
        summary: 'Get all unique party logo URLs for the authenticated user',
        description: `
            Returns a deduplicated, alphabetically sorted list of all non-null
            logo_url values from the current user's party registry.
            
            **Why no separate table?**
            All party logos are already stored in the \`parties.logo_url\` column.
            This endpoint simply aggregates DISTINCT values — no new table needed.
            The same URL can be reused across multiple parties, so showing the
            library de-duplicates it automatically.
            
            Use this to populate the "Image Library" tab in the party creation dialog.
            `,
    })
    @ApiResponse({
        status: 200,
        description: 'Array of unique logo URL strings',
        schema: {
            example: {
                data: [
                    'https://img.icons8.com/plasticine/1200/alpha.png',
                    'https://img.icons8.com/plasticine/1200/beta.png',
                ],
            },
        },
    })
    async getLogoLibrary(@Request() req: any) {
        return this.partyService.getDistinctLogoUrls(req.user.uguid);
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
    @ApiBody({
        description: 'Updated party data with optional logo image',
        type: UpdatePartyMasterDto,
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
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    async update(
        @Param('id') id: string,
        @Body() updatePartyDto: UpdatePartyMasterDto,
        @Request() req,
        @UploadedFile(
              new ParseFilePipe({
                validators: [
                  new MaxFileSizeValidator({ maxSize: maxFileSize }),
                  new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                ],
                fileIsRequired: false,
              }),
            ) file?: Express.Multer.File
    ): Promise<ResponseDto<PartyMaster>> {
        const party = await this.partyService.update(id, updatePartyDto, req.user, file);
        const message = file
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