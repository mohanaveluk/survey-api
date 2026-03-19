import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entity/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from 'src/shared/email/email.service';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { contactAdminTemplate } from 'src/shared/email/templates/contact-admin.template';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private emailService: EmailService,
    private logger: CustomLoggerService
  ) {}

  async create(createContactDto: CreateContactDto ) {
    // Save contact form data
    const contact = this.contactRepository.create(createContactDto);
    contact.created_at = new Date();
    await this.contactRepository.save(contact);

    this.logger.debug('Sending email...');
    // Send email notification to admin
    await this.emailService.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      html: contactAdminTemplate(createContactDto),
    });
    this.logger.debug('Email has been sent');
    
    return {
      message: 'Your message has been sent successfully',
      contact,
    };
  }

  async findAll() {
    return await this.contactRepository.find();
  }
}