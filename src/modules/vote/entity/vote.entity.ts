import { Party } from 'src/modules/party/entity/party.entity';
import { Survey } from 'src/modules/survey/entity/survey.entity';
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';



@Entity('votes')
export class Vote {

  @PrimaryColumn()
  id: string;
  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @Column({ name: 'voter_email' })
  voterEmail: string;

  @Column({ name: 'voted_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  votedAt: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'survey_id' })
  surveyId: string;

  @Column({ name: 'party_id' })
  partyId: string;

  @ManyToOne(() => Survey)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @ManyToOne(() => Party)
  @JoinColumn({ name: 'party_id' })
  party: Party;
}