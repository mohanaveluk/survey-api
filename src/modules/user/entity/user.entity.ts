import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { PasswordArchive } from './password-archive.entity';
import { RoleEntity } from './roles.entity';
import { UserLoginHistory } from 'src/modules/auth/entity/user-login-history.entity';
import { RefreshToken } from './refresh-token.entity';
import { Survey } from 'src/modules/survey/entity/survey.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column({nullable: true})
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable: false})
  password: string;

  @Column({nullable: true})
  mobile: string;

  @Column({nullable: true})
  major: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true })
  verification_code: string;

  @Column({ nullable: true })
  verification_code_expiry: Date;
  
  @Column({ type: 'datetime' })
  created_at: Date
  
  @Column({ type: 'datetime', nullable: true })
  updated_at: Date
  
  @Column({ default: '1' })
  is_active: number
  
  @Column({nullable: false})
  uguid: string

  @ManyToOne(() => RoleEntity, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @Column({ nullable: true })
  role_id: number;

  @Column({ nullable: true })
  profile_image: string;

  @Column({ default: false, name: 'is_deleted' })
  is_deleted: boolean;

  @Column({ nullable: true })
  last_login: Date;

  @OneToMany(() => PasswordArchive, passwordArchive => passwordArchive.user)
  password_history: PasswordArchive[];


  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => UserLoginHistory, userLoginHistory => userLoginHistory.user)
  login_history: UserLoginHistory[];

  @OneToMany(() => Survey, survey => survey.creator)
  surveys: Survey[];

}