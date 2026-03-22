import { Body, Controller, Delete, HttpStatus, Param, Post, Put, UseGuards, Request, Patch, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SurveyService } from "./survey.service";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { ResponseDto } from "src/common/dto/response.dto";
import { Survey, SurveyStatus } from "./entity/survey.entity";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { PublishSurveyDto, UpdatePartyIdsDto, UpdateSurveyDto } from "./dto/update-survey.dto";

@ApiTags('Survey')
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new survey',
    description:
      'Creates a new survey with unique ID and name. Survey starts in DRAFT status.',
  })
  @ApiBody({ type: CreateSurveyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Survey created successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Survey with this ID or name already exists',
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
    @Body() createSurveyDto: CreateSurveyDto,
    @Request() req
  ): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.create(createSurveyDto, req.user);
    return ResponseDto.created(
      survey,
      'Survey created successfully in DRAFT status'
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all surveys',
    description:
      'Retrieves a list of all surveys with their associated parties and creator information',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search surveys by name (case-insensitive partial match)',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status',
    type: Boolean,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by survey status',
    enum: SurveyStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Surveys retrieved successfully',
    type: ResponseDto<Survey[]>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve surveys',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('active') active?: boolean,
    @Query('status') status?: SurveyStatus
  ): Promise<ResponseDto<Survey[]>> {
    let surveys: Survey[];

    if (search) {
      surveys = await this.surveyService.findByName(search);
    } else if (status) {
      surveys = await this.surveyService.findByStatus(status);
    } else if (active !== undefined) {
      surveys = active
        ? await this.surveyService.findActive()
        : await this.surveyService.findAll();
    } else {
      surveys = await this.surveyService.findAll();
    }

    let message = '';
    if (search) {
      message = `Found ${surveys.length} surveys matching '${search}'`;
    } else if (status) {
      message = `Retrieved ${surveys.length} surveys with status '${status}'`;
    } else if (active !== undefined && active) {
      message = `Retrieved ${surveys.length} active surveys`;
    } else {
      message = `Retrieved ${surveys.length} surveys`;
    }

    return ResponseDto.success(surveys, message);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Get active surveys',
    description: 'Retrieves all active surveys with their associated parties',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active surveys retrieved successfully',
    type: ResponseDto<Survey[]>,
  })
  async findActive(): Promise<ResponseDto<Survey[]>> {
    const surveys = await this.surveyService.findActive();
    return ResponseDto.success(
      surveys,
      `Retrieved ${surveys.length} active surveys`
    );
  }

  @Get('u/:userId') // Changed route to avoid conflict with findOne by user
  @ApiOperation({
    summary: 'Get survey by user ID',
    description:
      'Retrieves surveys created by a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique identifier of the user',
    example: 'USER001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey retrieved successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid survey ID format',
  })
  async findByUserId(@Param('userId') userId: string): Promise<ResponseDto<Survey[]>> {
    const surveys = await this.surveyService.findByUserId(userId);
    return ResponseDto.success(surveys, `Retrieved ${surveys.length} surveys for user '${userId}'`);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get survey by ID',
    description:
      'Retrieves a specific survey by its unique identifier including associated parties',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey retrieved successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid survey ID format',
  })
  async findOne(@Param('id') id: string): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.findOne(id);
    return ResponseDto.success(survey, 'Survey retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update survey (DRAFT only)',
    description:
      'Updates an existing survey. Only surveys in DRAFT status can be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey to update',
    example: 'SURVEY001',
  })
  @ApiBody({ type: UpdateSurveyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey updated successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot update survey (not in DRAFT status or not owner)',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Survey name already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSurveyDto: UpdateSurveyDto,
    @Request() req
  ): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.update(
      id,
      updateSurveyDto,
      req.user
    );
    return ResponseDto.updated(survey, 'Survey updated successfully');
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publish survey',
    description:
      'Changes survey status from DRAFT to PUBLISHED or CLOSED. Once published, survey cannot be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey to publish',
    example: 'SURVEY001',
  })
  @ApiBody({ type: PublishSurveyDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey published successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot publish survey (not in DRAFT status or not owner)',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Survey not ready for publishing (missing required data)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async publishSurvey(
    @Param('id') id: string,
    @Body() publishDto: PublishSurveyDto,
    @Request() req
  ): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.publishSurvey(
      id,
      publishDto,
      req.user
    );
    const statusText =
      survey.status === SurveyStatus.PUBLISHED ? 'published' : 'closed';
    return ResponseDto.updated(survey, `Survey ${statusText} successfully`);
  }

  @Put(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Close survey',
    description:
      'Changes survey status from DRAFT to CLOSED. Once published, survey cannot be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey to publish',
    example: 'SURVEY001',
  })
  @ApiBody({ type: PublishSurveyDto, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey published successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot publish survey (not in DRAFT status or not owner)',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Survey not ready for publishing (missing required data)',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async closeSurvey(
    @Param('id') id: string,
    @Body() publishDto: PublishSurveyDto,
    @Request() req
  ): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.closeSurvey(
      id,
      publishDto,
      req.user
    );
    const statusText =
      survey.status === SurveyStatus.PUBLISHED ? 'published' : 'closed';
    return ResponseDto.updated(survey, `Survey ${statusText} successfully`);
  }

  @Put(':id/toggle-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Toggle survey active status',
    description: 'Toggles the active status of a survey (active/inactive)',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey status toggled successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async toggleActive(@Param('id') id: string): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.toggleActive(id);
    const status = survey.isActive ? 'activated' : 'deactivated';
    return ResponseDto.updated(survey, `Survey ${status} successfully`);
  }

  @Put(':id/votes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update vote count',
    description: 'Increments or decrements the total vote count for a survey',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        increment: {
          type: 'number',
          description: 'Number to add to vote count (can be negative)',
          example: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote count updated successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async updateVoteCount(
    @Param('id') id: string,
    @Body('increment') increment: number = 1
  ): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.updateVoteCount(id, increment);
    return ResponseDto.updated(
      survey,
      `Vote count updated successfully. Total votes: ${survey.totalVotes}`
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete survey',
    description: 'Deletes a survey if it has no associated parties',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the survey to delete',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey deleted successfully',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cannot delete survey with associated parties',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to delete survey',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    await this.surveyService.remove(id);
    return ResponseDto.deleted('Survey deleted successfully');
  }

  @Put(':id/parties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update party associations for a survey',
    description:
      'Updates the party associations for a survey. Only available for DRAFT surveys.',
  })
  @ApiParam({
    name: 'id',
    description: 'Survey ID',
    example: 'SURVEY001',
  })
  @ApiBody({ type: UpdatePartyIdsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Party associations updated successfully',
    type: ResponseDto<Survey>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey or parties not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot update non-DRAFT surveys or unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid party IDs or failed to update',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async updatePartyIds(
    @Param('id') id: string,
    @Body() updatePartyIdsDto: UpdatePartyIdsDto,
    @Request() req
  ): Promise<ResponseDto<Survey>> {
    const survey = await this.surveyService.updateSurveyPartyIds(
      id,
      updatePartyIdsDto.partyIds,
      req.user
    );
    return ResponseDto.success(
      survey,
      'Party associations updated successfully'
    );
  }

}
