import { Entity, Column, PrimaryColumn, OneToMany, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { SurveyParty } from '../../survey-party/entity/survey-party.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/modules/user/entity/user.entity';

@Entity('party')
export class PartyMaster {

  @PrimaryColumn()
  id: string;
  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }


  @Column({length: 255, nullable: false})
  name: string;

  @Column({ nullable: true, default: '#000000' })
  color: string;

  @Column({ length: 100, nullable: true })
  leader_name: string;

  @Column({ length: 100, nullable: true })
  contestant_name: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ name: 'created_by', length: 36, nullable: true })
  createdBy: string;

  @Column({ name: 'created_at', type: 'datetime', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => SurveyParty, sp => sp.party)
  surveys: SurveyParty[];

  @ManyToOne(() => User, (user) => user.parties)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'uguid' })
  creator: User;  
}