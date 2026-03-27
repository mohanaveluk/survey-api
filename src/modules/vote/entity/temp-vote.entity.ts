import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, BeforeInsert } from 'typeorm';
import { PartyMaster } from '../../party/entity/party.entity';
import { v4 as uuidv4 } from 'uuid';
import { Survey } from 'src/modules/survey/entity/survey.entity';

@Entity('temp_votes')
export class TempVote {
  @PrimaryColumn()
  id: string;
  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @Column({ name: 'voter_email' })
  voterEmail: string;

  @Column({ name: 'verification_code', length: 6 })
  verificationCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

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

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => Survey)
  @JoinColumn({ name: 'survey_id' })
  survey: Survey;

  @ManyToOne(() => PartyMaster)
  @JoinColumn({ name: 'party_id' })
  party: PartyMaster;
}