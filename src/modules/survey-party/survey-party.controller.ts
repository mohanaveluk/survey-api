import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SurveyPartyService } from "./survey-party.service";
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BulkCreateSurveyPartyDto, CreateSurveyPartyDto } from './dto/create-survey-party.dto';
import { SurveyParty } from './entity/survey-party.entity';
import { ResponseDto } from 'src/common/dto/response.dto';

@ApiTags('SurveyParty')
@Controller('SurveyParty')
export class SurveyPartyController {
    constructor(private readonly surveyPartyService: SurveyPartyService) {}

    @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Associate a party with a survey',
    description: 'Creates a new association between a survey and a party',
  })
  @ApiBody({ type: CreateSurveyPartyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Survey-Party association created successfully',
    type: ResponseDto<SurveyParty>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey or Party not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Association already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async create(
    @Body() createSurveyPartyDto: CreateSurveyPartyDto
  ): Promise<ResponseDto<SurveyParty>> {
    const surveyParty = await this.surveyPartyService.create(
      createSurveyPartyDto
    );
    return ResponseDto.created(
      surveyParty,
      'Survey-Party association created successfully'
    );
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Associate multiple parties with a survey',
    description:
      'Creates associations between a survey and multiple parties in bulk',
  })
  @ApiBody({ type: BulkCreateSurveyPartyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bulk Survey-Party associations created successfully',
    type: ResponseDto<SurveyParty[]>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey or one or more Parties not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'One or more associations already exist',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async bulkCreate(
    @Body() bulkCreateDto: BulkCreateSurveyPartyDto
  ): Promise<ResponseDto<SurveyParty[]>> {
    const surveyParties = await this.surveyPartyService.bulkCreate(
      bulkCreateDto
    );
    return ResponseDto.created(
      surveyParties,
      `Successfully associated ${surveyParties.length} parties with the survey`
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all survey-party associations',
    description: 'Retrieves all associations between surveys and parties',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey-Party associations retrieved successfully',
    type: ResponseDto<SurveyParty[]>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve associations',
  })
  async findAll(): Promise<ResponseDto<SurveyParty[]>> {
    const surveyParties = await this.surveyPartyService.findAll();
    return ResponseDto.success(
      surveyParties,
      `Retrieved ${surveyParties.length} survey-party associations`
    );
  }

  @Get('survey/:surveyId')
  @ApiOperation({
    summary: 'Get parties associated with a survey',
    description: 'Retrieves all parties associated with a specific survey',
  })
  @ApiParam({
    name: 'surveyId',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey parties retrieved successfully',
    type: ResponseDto<SurveyParty[]>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve survey parties',
  })
  async findBySurvey(
    @Param('surveyId') surveyId: string
  ): Promise<ResponseDto<SurveyParty[]>> {
    const surveyParties = await this.surveyPartyService.findBySurvey(surveyId);
    return ResponseDto.success(
      surveyParties,
      `Found ${surveyParties.length} parties associated with survey '${surveyId}'`
    );
  }

  @Get('party/:partyId')
  @ApiOperation({
    summary: 'Get surveys associated with a party',
    description: 'Retrieves all surveys associated with a specific party',
  })
  @ApiParam({
    name: 'partyId',
    description: 'Unique identifier of the party',
    example: 'PARTY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Party surveys retrieved successfully',
    type: ResponseDto<SurveyParty[]>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Party not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve party surveys',
  })
  async findByParty(
    @Param('partyId') partyId: string
  ): Promise<ResponseDto<SurveyParty[]>> {
    const surveyParties = await this.surveyPartyService.findByParty(partyId);
    return ResponseDto.success(
      surveyParties,
      `Found ${surveyParties.length} surveys associated with party '${partyId}'`
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get survey-party association by ID',
    description: 'Retrieves a specific survey-party association by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey-party association',
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey-Party association retrieved successfully',
    type: ResponseDto<SurveyParty>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey-Party association not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid association ID format',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: string
  ): Promise<ResponseDto<SurveyParty>> {
    const surveyParty = await this.surveyPartyService.findOne(id);
    return ResponseDto.success(
      surveyParty,
      'Survey-Party association retrieved successfully'
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove survey-party association by ID',
    description: 'Removes a specific survey-party association by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey-party association to remove',
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey-Party association deleted successfully',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey-Party association not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to delete association',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async remove(
    @Param('id', ParseIntPipe) id: string
  ): Promise<ResponseDto<null>> {
    await this.surveyPartyService.remove(id);
    return ResponseDto.deleted('Survey-Party association deleted successfully');
  }

  @Delete('survey/:surveyId/party/:partyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove survey-party association by Survey ID and Party ID',
    description: 'Removes the association between a specific survey and party',
  })
  @ApiParam({
    name: 'surveyId',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiParam({
    name: 'partyId',
    description: 'Unique identifier of the party',
    example: 'PARTY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey-Party association deleted successfully',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey-Party association not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to delete association',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async removeBySurveyAndParty(
    @Param('surveyId') surveyId: string,
    @Param('partyId') partyId: string
  ): Promise<ResponseDto<null>> {
    await this.surveyPartyService.removeBySurveyAndParty(surveyId, partyId);
    return ResponseDto.deleted(
      `Association between survey '${surveyId}' and party '${partyId}' deleted successfully`
    );
  }

  @Delete('survey/:surveyId/parties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Remove all party associations for a survey',
    description: 'Removes all party associations for a specific survey',
  })
  @ApiParam({
    name: 'surveyId',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All party associations removed successfully',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to remove associations',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async removeAllBySurvey(
    @Param('surveyId') surveyId: string
  ): Promise<ResponseDto<null>> {
    const removedCount = await this.surveyPartyService.removeAllBySurvey(
      surveyId
    );
    return ResponseDto.deleted(
      `Successfully removed ${removedCount} party associations for survey '${surveyId}'`
    );
  }
}