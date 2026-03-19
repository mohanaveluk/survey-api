import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto/response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Vote } from './entity/vote.entity';
import { SurveyVoteSummaryDto } from './dto/vote-summary.dto';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@ApiTags('Vote')
@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @ApiOperation({
    summary: 'Cast a vote',
    description: 'Creates a new vote for a survey and party',
  })
  @ApiBody({ type: CreateVoteDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vote created successfully',
    type: ResponseDto<Vote>,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Vote ID already exists or voter has already voted in this survey',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey or Party not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or survey is not active',
  })
  async create(
    @Body() createVoteDto: CreateVoteDto
  ): Promise<ResponseDto<Vote>> {
    const vote = await this.voteService.create(createVoteDto);
    return ResponseDto.created(vote, 'Vote created successfully');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all votes',
    description:
      'Retrieves a list of all votes with survey and party information',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Votes retrieved successfully',
    type: ResponseDto<Vote[]>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve votes',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findAll(): Promise<ResponseDto<Vote[]>> {
    const votes = await this.voteService.findAll();
    return ResponseDto.success(votes, `Retrieved ${votes.length} votes`);
  }

  @Get('survey/:surveyId')
  @ApiOperation({
    summary: 'Get votes by survey ID',
    description: 'Retrieves all votes for a specific survey',
  })
  @ApiParam({
    name: 'surveyId',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Survey votes retrieved successfully',
    type: ResponseDto<Vote[]>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve survey votes',
  })
  async findBySurveyId(
    @Param('surveyId') surveyId: string
  ): Promise<ResponseDto<Vote[]>> {
    const votes = await this.voteService.findBySurveyId(surveyId);
    return ResponseDto.success(
      votes,
      `Found ${votes.length} votes for survey '${surveyId}'`
    );
  }

  @Get('survey/:surveyId/summary')
  @ApiOperation({
    summary: 'Get vote summary for a survey',
    description:
      'Retrieves vote statistics and breakdown by party for a specific survey',
  })
  @ApiParam({
    name: 'surveyId',
    description: 'Unique identifier of the survey',
    example: 'SURVEY001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote summary retrieved successfully',
    type: ResponseDto<SurveyVoteSummaryDto>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Survey not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to generate vote summary',
  })
  async getSurveyVotesSummary(
    @Param('surveyId') surveyId: string
  ): Promise<ResponseDto<SurveyVoteSummaryDto>> {
    const summary = await this.voteService.getSurveyVotesSummary(surveyId);
    return ResponseDto.success(summary, 'Vote summary retrieved successfully');
  }

  @Get('check-voter')
  @ApiOperation({
    summary: 'Check if voter has voted',
    description:
      'Checks if a voter with given email has already voted in a specific survey',
  })
  @ApiQuery({
    name: 'surveyId',
    description: 'ID of the survey to check',
    example: 'SURVEY001',
  })
  @ApiQuery({
    name: 'email',
    description: 'Email of the voter to check',
    example: 'voter@example.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voter status checked successfully',
    type: ResponseDto<boolean>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to check voter status',
  })
  async checkVoterStatus(
    @Query('surveyId') surveyId: string,
    @Query('email') email: string
  ): Promise<ResponseDto<boolean>> {
    const hasVoted = await this.voteService.checkIfVoterHasVoted(
      surveyId,
      email
    );
    const message = hasVoted
      ? `Voter '${email}' has already voted in survey '${surveyId}'`
      : `Voter '${email}' has not voted in survey '${surveyId}' yet`;

    return ResponseDto.success(hasVoted, message);
  }

  @Get('voter/:email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get votes by voter email',
    description: 'Retrieves all votes cast by a specific voter',
  })
  @ApiParam({
    name: 'email',
    description: 'Email of the voter',
    example: 'voter@example.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Voter votes retrieved successfully',
    type: ResponseDto<Vote[]>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to retrieve voter votes',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findByVoterEmail(
    @Param('email') email: string
  ): Promise<ResponseDto<Vote[]>> {
    const votes = await this.voteService.getVotesByEmail(email);
    return ResponseDto.success(
      votes,
      `Found ${votes.length} votes for voter '${email}'`
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get vote by ID',
    description: 'Retrieves a specific vote by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the vote',
    example: 'VOTE001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote retrieved successfully',
    type: ResponseDto<Vote>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vote not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid vote ID format',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async findOne(@Param('id') id: string): Promise<ResponseDto<Vote>> {
    const vote = await this.voteService.findOne(id);
    return ResponseDto.success(vote, 'Vote retrieved successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete vote',
    description: 'Deletes a vote and updates the survey total vote count',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the vote to delete',
    example: 'VOTE001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote deleted successfully',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vote not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to delete vote',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    await this.voteService.remove(id);
    return ResponseDto.deleted('Vote deleted successfully');
  }
}
