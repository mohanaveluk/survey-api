import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Survey } from '../../survey/entity/survey.entity';
import { PartyMaster } from '../../party/entity/party.entity';

@Entity('survey_parties')
export class SurveyParty {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Survey, survey => survey.parties)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @ManyToOne(() => PartyMaster, party => party.surveys)
  @JoinColumn({ name: 'party_id' })
  party: PartyMaster;
}