import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
//   @ApiProperty({
//     example: 'VOTE001',
//     description: 'ID of the vote',
//   })
//   id: string;

  @ApiProperty({
    example: 'voter@example.com',
    description: 'Email of the voter',
  })
  voterEmail: string;

  @ApiProperty({
    example: '2026-03-16T10:30:00Z',
    description: 'When the vote was cast',
  })
  votedAt: Date;

  @ApiProperty({
    example: 'Male',
    description: 'Gender of the voter',
  })
  gender: string;

  @ApiProperty({
    example: 25,
    description: 'Age of the voter',
  })
  age: number;

  @ApiProperty({
    example: 'New York',
    description: 'Location of the voter',
  })
  location: string;

  @ApiProperty({
    description: 'Survey information',
  })
  survey: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: 'Party information',
  })
  party: {
    id: string;
    name: string;
    color: string;
  };
}

export class VoteSummaryDto {
  @ApiProperty({
    example: 'PARTY001',
    description: 'ID of the party',
  })
  partyId: string;

  @ApiProperty({
    example: 'Democratic Party',
    description: 'Name of the party',
  })
  partyName: string;

  @ApiProperty({
    example: '#FF0000',
    description: 'Color of the party',
  })
  partyColor: string;

  @ApiProperty({
    example: 150,
    description: 'Total number of votes for this party',
  })
  totalVotes: number;

  @ApiProperty({
    example: 25.5,
    description: 'Percentage of total votes',
  })
  percentage: number;
}

export class SurveyVoteSummaryDto {
  @ApiProperty({
    example: 'SURVEY001',
    description: 'ID of the survey',
  })
  surveyId: string;

  @ApiProperty({
    example: 'Presidential Election 2026',
    description: 'Name of the survey',
  })
  surveyName: string;

  @ApiProperty({
    example: 590,
    description: 'Total number of votes in the survey',
  })
  totalVotes: number;

  @ApiProperty({
    type: [VoteSummaryDto],
    description: 'Vote breakdown by party',
  })
  partyVotes: VoteSummaryDto[];

  @ApiProperty({
    example: '2026-03-16T10:30:00Z',
    description: 'Last vote timestamp',
  })
  lastVoteDate: Date;
}
