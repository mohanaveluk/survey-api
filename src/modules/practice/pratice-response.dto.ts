import { ApiProperty } from "@nestjs/swagger";

export class PracticeDetailDto {

    @ApiProperty({description: 'Practice GUID', example: '123e4567-e89b-12d3-a456-426614174000' })
    practiceGuid: string;

    @ApiProperty({description: 'Practice Name', example: 'Downtown Dental Clinic' })
    practiceName: string;

    @ApiProperty({description: 'Address Line 1', example: '123 Main St' })
    address1: string;

    @ApiProperty({description: 'Address Line 2', example: '123 Main St' })
    address2: string;

    @ApiProperty({description: 'City', example: 'Springfield' })
    city: string;
    
    @ApiProperty({description: 'State', example: 'IL' })
    state: string;

    @ApiProperty({description: 'ZIP Code', example: '62701' })
    zip: string;

    @ApiProperty({description: 'Country', example: 'USA' })
    country: string;
    
    @ApiProperty({description: 'Phone Number', example: '(555) 123-4567' })
    primary_phone: string;

    @ApiProperty({description: 'Dentist Name', example: 'Dr. John Smith'})
    dentist_name: string;
    
    @ApiProperty({description: 'Logo URL', example: 'https://example.com/logo.png'})
    logo_url: string;

    @ApiProperty({description: 'Email Address', example: 'info@asterdentaltx.com'})
    primary_email: string;

    @ApiProperty({description: 'Timezone', example: 'America/Chicago'})
    timezone: string;

}

export class OpenDentalClinicDto {
    @ApiProperty({ description: 'Clinic ID', example: 1 })
    id: number;
    @ApiProperty({ description: 'Clinic Name', example: 'Downtown Dental Clinic' })
    name: string;
}

export class PracticeResponseDto {
    @ApiProperty({ description: 'Practice Details', type: PracticeDetailDto, nullable: true })
    practiceDetail: PracticeDetailDto | null;
    
    @ApiProperty({ description: 'Open Dental Clinics', type: [OpenDentalClinicDto] })
    odClinics: OpenDentalClinicDto[];

}