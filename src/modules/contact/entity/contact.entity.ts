import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contact_tbl')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text',{name: 'full_name'})
  fullName: string;

  @Column()
  email: string;

  @Column({nullable: true})
  mobile: string;

  @Column('text')
  message: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}