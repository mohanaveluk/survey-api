import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { TokenService } from './token.service';
import { addMinutes } from 'date-fns';
import { Request } from 'express';
import { User } from '../user/entity/user.entity';
import { PasswordArchive } from '../user/entity/password-archive.entity';
import { RoleEntity } from '../user/entity/roles.entity';
import { OTC } from '../user/entity/otc.entity';
import { DateService } from 'src/shared/services/date.service';
import { StorageService } from 'src/shared/services/storage.service';
import { EmailService } from 'src/shared/email/email.service';
import { CommonService } from 'src/common/common.service';
import { UserLoginHistoryService } from './user-login-history.service';
import { RegisterDto } from './dto/register.dto';
import { verifyEmailTemplate } from 'src/shared/email/templates/verify-email-template';
import { UpdateProfileDto } from '../user/dto/update-profile.dto';
import { VerifyEmailDto } from '../user/dto/verify-email.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from '../user/dto/update-password.dto';
import { ValidateOTCDto } from '../user/dto/validate-otc.dto';
import { MobileLoginDto } from './dto/mobile-login.dto';
import { passwordResetTemplate } from 'src/shared/email/templates/password-reset.template';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';
import { ResendOTCDto } from '../user/dto/resend-otc.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CustomLoggerService } from '../logger/custom-logger.service';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordArchive)
    private passwordArchiveRepository: Repository<PasswordArchive>,
    @InjectRepository(RoleEntity)
    private rolesRepository: Repository<RoleEntity>,   
    @InjectRepository(OTC)
    private otcRepository: Repository<OTC>, 
    private jwtService: JwtService,
    private dateService: DateService,
    private tokenService: TokenService,
    private storageService: StorageService,
    private emailService: EmailService,
    private commonService: CommonService,
    private userLoginHistoryService: UserLoginHistoryService,
    private logger: CustomLoggerService
  ) {}

  async register(registerDto: RegisterDto) {
    try {

      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email, is_email_verified: true },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exist');
      }

      const unverifiedUser = await this.userRepository.findOne({
        where: { email: registerDto.email, is_email_verified: false },
      });

      let role = await this.rolesRepository.findOne({ where: { guid: registerDto.role_guid } });
      if (!role) {
        role = await this.rolesRepository.findOne({ where: { name: 'user' } });
        if (!role) {
          throw new Error('Default role not found');
        }
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const verificationCode = this.generateOTC();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      if(unverifiedUser){
        // Update user properties
        Object.assign(unverifiedUser, registerDto);
        unverifiedUser.password = hashedPassword;
        unverifiedUser.updated_at = new Date();
        unverifiedUser.verification_code = verificationCode;
        unverifiedUser.verification_code_expiry = verificationCodeExpiry;
        unverifiedUser.is_email_verified = false;
        unverifiedUser.is_active = 0;
      }

      const user = unverifiedUser ? unverifiedUser : (this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        uguid: uuidv4(),
        role,
        role_id: role.id,
        created_at: new Date(await this.dateService.getCurrentDateTime()),
        verification_code: verificationCode,
        verification_code_expiry: verificationCodeExpiry,
        is_email_verified: false,
        is_active: 0
      }));

      const savedUser = await this.userRepository.save(user);
      const tokens = await this.tokenService.generateTokens(savedUser);

      // Send verification email
      this.logger.debug('Sending email...');
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: verifyEmailTemplate(verificationCode),
      });
      this.logger.debug('Email has been sent');

      //await this.userRepository.save(user);
      return { message: 'User registered successfully. Please check your email for verification code.' };
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(userGuid: string, updateProfileDto: UpdateProfileDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { uguid: userGuid },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if email is being updated and is unique
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateProfileDto.email },
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      if(!this.commonService.isNullOrEmpty(updateProfileDto.password)){
        const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
        updateProfileDto.password = hashedPassword;
      }

      // Update user properties
      Object.assign(user, updateProfileDto);
      user.updated_at = new Date();

      await this.userRepository.save(user);
      return { message: 'Profile updated successfully', profileImage: user.profile_image };
    } catch (error) {
      throw error;
    }
  }

  
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email: verifyEmailDto.email }
    });

    if (!user) {
      throw new BadRequestException('Invalid email address');
    }

    if (user.is_email_verified) {
      return { message: 'Email already verified' };
    }

    if (!user.verification_code || 
        user.verification_code !== verifyEmailDto.code ||
        new Date() > user.verification_code_expiry) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    user.is_email_verified = true;
    user.verification_code = null;
    user.verification_code_expiry = null;
    user.is_active = 1;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully' };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users =  await this.userRepository.find({
        where: { is_active: 1, is_email_verified: true },
    });

    let userResponses = [];
    users.forEach(user => {
      const detail = {
        uguid: user.uguid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        major: user.major,
        mobile: user.mobile,
        profileImage: user.profile_image
      };
      userResponses.push(detail);
    });
    return userResponses;
  }
  
  async login(loginDto: LoginDto, req: Request) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new NotFoundException('Oops, Invalid User Id.');
    }

    if (user.is_active == 0 || !user.is_email_verified) {
      throw new UnauthorizedException('Oops, User is disabled or email is not verified.');
    }

    if (!user.is_email_verified) {
      // Generate new verification code if needed
      if (!user.verification_code || new Date() > user.verification_code_expiry) {
        const verificationCode = this.generateOTC();
        const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

        user.verification_code = verificationCode;
        user.verification_code_expiry = verificationCodeExpiry;
        await this.userRepository.save(user);

        // Send verification email
        await this.emailService.sendEmail({
          to: user.email,
          subject: 'Verify Your Email Address',
          html: verifyEmailTemplate(verificationCode),
        });
      }

      throw new UnauthorizedException('Please verify your email address. A verification code has been sent to your email.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Oops, Password is incorrect.');
    }

    // Record login
    const loginTime = new Date();
    await this.userLoginHistoryService.recordLogin(
      user.id,
      user.uguid,
      loginTime,
      req.ip,
      req.headers['user-agent']
    );

    user.last_login = loginTime;
    this.userRepository.save(user);
    /*const payload = { 
      sub: user.uguid, 
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };
    
    return {
      status: true,
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.uguid,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      }      
   };*/
    this.logger.debug(`user: '${user.email}' Logged in successfully, generating tokens...`);
    return this.tokenService.generateTokens(user);

  }

  async updatePassword(userGuId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { uguid: userGuId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Archive the current password
    const passwordArchive = this.passwordArchiveRepository.create({
      password: user.password,
      user_id: user.id,
      user: user
    });
    await this.passwordArchiveRepository.save(passwordArchive);

    // Update to new password
    const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async getUserInfo(userGuid: string){
    const user = await this.userRepository.findOne({
      where: { uguid: userGuid },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.password = "";
    return user;
  }

  async logout(userId: number, uguid: string) {
    await this.tokenService.revokeAllUserRefreshTokens(userId);
    await this.userLoginHistoryService.recordLogout(uguid);
    return { message: 'Logged out successfully' };
  }


  async uploadProfileImage(userGuid: string, file: Express.Multer.File): Promise<{ message: string; imageUrl: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { uguid: userGuid },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const imageUrl = await this.storageService.uploadFile(file);
      
      user.profile_image = imageUrl;
      user.updated_at = new Date();
      await this.userRepository.save(user);

      return {
        message: 'Profile image uploaded successfully',
        imageUrl,
      };
    } catch (error) {
      throw error;
    }
  }


  

  private generateOTC(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendMobileOTC(mobile: string): Promise<{ message: string }> {
    try {
      // Deactivate any existing OTCs for this mobile
      await this.otcRepository.update(
        { mobile, is_active: 1 },
        { is_active: 0 }
      );

      const code = this.generateOTC();
      const otc = this.otcRepository.create({
        mobile,
        code,
        expiry_datetime: addMinutes(new Date(), 10), // 10 minutes expiry
      });

      await this.otcRepository.save(otc);

      // TODO: Integrate with SMS service
      console.log(`OTC for ${mobile}: ${code}`);

      return { message: 'OTC sent successfully' };
    } catch (error) {
      throw error;
    }
  }

  async validateOTC(validateOTCDto: ValidateOTCDto): Promise<{ access_token?: string; message: string }> {
    try {
      const otc = await this.otcRepository.findOne({
        where: {
          mobile: validateOTCDto.mobile,
          code: validateOTCDto.code,
          is_active: 1,
        },
      });

      if (!otc) {
        throw new BadRequestException('Invalid OTC');
      }

      if (new Date() > otc.expiry_datetime) {
        throw new BadRequestException('OTC has expired');
      }

      // Deactivate the OTC
      otc.is_active = 0;
      await this.otcRepository.save(otc);

      // Find or create user
      let user = await this.userRepository.findOne({
        where: { mobile: validateOTCDto.mobile },
      });

      if (!user) {
        user = this.userRepository.create({
          mobile: validateOTCDto.mobile,
          created_at: new Date(),
        });
        await this.userRepository.save(user);
      }

      // Generate JWT token
      const payload = { sub: user.id, mobile: user.mobile };
      return {
        access_token: this.jwtService.sign(payload),
        message: 'OTC validated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async loginWithMobile(mobileLoginDto: MobileLoginDto): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { mobile: mobileLoginDto.mobile },
      });

      if (!user) {
        throw new BadRequestException('Mobile number not registered');
      }

      return this.sendMobileOTC(mobileLoginDto.mobile);
      
    } catch (error) {
      throw error;
    }
  }

  private async generateResetToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'password_reset' };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }
  
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
  
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive password reset instructions' };
      }
  
      const token = await this.generateResetToken(user.uguid);
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset?token=${token}`;
        // Send password reset email
      this.logger.debug(`Sending email with reset link for user: '${user.email}'`);
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: passwordResetTemplate(resetLink),
      });
  
      return { message: 'If your email is registered, you will receive password reset instructions' };
    } catch (error) {
      throw error;
    }
  }
  
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      
      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }
  
      const user = await this.userRepository.findOne({
        where: { uguid: payload.sub },
      });
  
      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }
  
      // Archive current password
      const passwordArchive = this.passwordArchiveRepository.create({
        password: user.password,
        user_id: user.id,
        user: user
      });
      await this.passwordArchiveRepository.save(passwordArchive);
  
      // Update password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
      user.password = hashedPassword;
      user.updated_at = new Date();
      await this.userRepository.save(user);
      this.logger.debug(`Password reset successfully for user: '${user.email}'`);
      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Invalid or expired reset token');
      }
      throw error;
    }
  }

  async resendVerificationCode(resendOTCDto: ResendOTCDto): Promise<{ message: string }>{
    try {
      const user = await this.userRepository.findOne({
        where: { email: resendOTCDto.email },
      });

      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return { message: 'If your email is registered, you will receive verification code' };
      }
      const verificationCode = this.generateOTC();
      const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
      
      user.verification_code = verificationCode;
      user.verification_code_expiry = verificationCodeExpiry;
      await this.userRepository.save(user);
      
      // Send verification email
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: verifyEmailTemplate(verificationCode),
      });

      return { message: 'The verification code has been sent again. Please check your email for verification code' };

    } catch (error) {
      throw error;
    }
  }

  /*async getUserPermissions(userId: string): Promise<Permission[]> {
    try {

      const userEntity = await this.userRepository.findOne({
        where: { uguid: userId },
      });

      const user = await this.userRepository.findOne({
        where: { uguid: userId },
        relations: ['groups', 'groups.permissions'] //, 'groups.permissions'
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Collect unique permissions from all user groups
      const permissions = new Set<Permission>();
      user.groups.forEach(group => {
        group.permissions.forEach(permission => {
          permissions.add(permission);
        });
      });

      return Array.from(permissions);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }*/
  
  //  user related apis
  async findAllRoles(): Promise<RoleEntity[]> {
    try {
      const roles = await this.rolesRepository.find({
        order: { name: 'ASC' }
      });
      return roles;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
        relations: ['role']
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
  

  async updateUser(uguid: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { uguid, is_deleted: false },
        relations: ['role']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${uguid} not found`);
      }

      const role = await this.rolesRepository.findOne({
        where: {guid: updateUserDto.roleGuid}
      });

      // Validate email uniqueness if email is being updated
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email, is_deleted: false }
        });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }
      }

      Object.assign(user, updateUserDto);
      user.role = role;
      user.role_id = role?.id || null;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async toggleStatus(uguid: string, isActive: boolean): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { uguid, is_deleted: false },
        relations: ['role']
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${uguid} not found`);
      }

      user.is_active = isActive ? 1 : 0;
      user.updated_at = new Date();
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user status');
    }
  }

}