import { Entity, Column, PrimaryColumn, OneToMany, BeforeInsert } from 'typeorm';
import { SurveyParty } from '../../survey-party/entity/survey-party.entity';
import { v4 as uuidv4 } from 'uuid';

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

  @Column({ nullable: true })
  logo_url: string;

  @OneToMany(() => SurveyParty, sp => sp.party)
  surveys: SurveyParty[];
}