import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { SurveyParty } from '../../survey-party/entity/survey-party.entity';
import { User } from 'src/modules/user/entity/user.entity';

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

  @Column({ name: 'created_by', nullable: true })
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

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: true })
  isAnonymous: boolean;


  @OneToMany(() => SurveyParty, sp => sp.survey)
  parties: SurveyParty[];

  @ManyToOne(() => User, (user) => user.surveys)
  @JoinColumn({ name: 'creatorId' })
  creator: User;  
}