import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSurveyPartyDto } from './create-survey-party.dto';

export class UpdateSurveyPartyDto extends PartialType(
  OmitType(CreateSurveyPartyDto, ['surveyId', 'partyId'] as const)
) {
  // Only allowing updates to the relationship metadata if needed in the future
  // Currently no updatable fields for the junction table
}
