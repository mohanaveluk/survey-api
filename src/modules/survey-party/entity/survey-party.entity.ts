import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  PrimaryColumn
} from 'typeorm';
import { Survey } from '../../survey/entity/survey.entity';
import { PartyMaster } from '../../party/entity/party.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('survey_parties')
export class SurveyParty {

  @PrimaryColumn()
  id: string;
  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @ManyToOne(() => Survey, survey => survey.surveyParties)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @ManyToOne(() => PartyMaster, party => party.surveys)
  @JoinColumn({ name: 'party_id' })
  party: PartyMaster;
}