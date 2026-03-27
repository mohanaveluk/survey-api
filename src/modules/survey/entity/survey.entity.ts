import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { SurveyParty } from '../../survey-party/entity/survey-party.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Vote } from 'src/modules/vote/entity/vote.entity';

export enum SurveyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

@Entity('surveys')
export class Survey {

  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_by', nullable: true, type: 'uuid' })
  createdBy: string;

  @Column({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'total_votes', default: 0 })
  totalVotes: number;

  @Column({
    type: 'enum',
    enum: SurveyStatus,
    default: SurveyStatus.DRAFT,
  })
  status: SurveyStatus;

  @Column({name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_anonymous', default: true })
  isAnonymous: boolean;


  @OneToMany(() => SurveyParty, sp => sp.survey)
  surveyParties: SurveyParty[];

  @OneToMany(() => Vote , vote => vote.survey)
  votes: Vote[];

  @ManyToOne(() => User, (user) => user.surveys)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uguid' })
  creator: User;  
}