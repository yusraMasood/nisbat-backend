import {
	IsString,
	IsOptional,
	IsEnum,
	IsDateString,
	IsUUID,
	IsNotEmpty,
} from 'class-validator';

export enum Gender {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export enum MaritalStatus {
	SINGLE = 'Single',
	MARRIED = 'Married',
	DIVORCED = 'Divorced',
	WIDOWED = 'Widowed',
	SEPARATED = 'Separated',
}

export enum CandidateStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
}

export class CreateCandidateDto {
	@IsOptional()
	@IsUUID()
	id?: string;

	@IsString()
	@IsNotEmpty()
	fullName: string;

	@IsOptional()
	@IsString()
	image?: string;

	@IsEnum(Gender)
	gender: Gender;

	@IsDateString()
	dob: string;

	@IsEnum(MaritalStatus)
	maritalStatus: MaritalStatus;

	@IsOptional()
	@IsString()
	height?: string;

	@IsString()
	@IsNotEmpty()
	religion: string;

	@IsOptional()
	@IsString()
	caste?: string;

	@IsOptional()
	@IsString()
	language?: string;

	@IsOptional()
	@IsString()
	education?: string;

	@IsOptional()
	@IsString()
	job?: string;

	@IsOptional()
	@IsString()
	income?: string;

	// Preferences
	@IsOptional()
	@IsString()
	preferredAge?: string;

	@IsOptional()
	@IsString()
	preferredHeight?: string;

	@IsOptional()
	@IsString()
	preferredEducation?: string;

	@IsOptional()
	@IsString()
	preferredCaste?: string;

	@IsOptional()
	@IsString()
	preferredLanguage?: string;

	@IsOptional()
	@IsString()
	otherPreferred?: string;

	@IsOptional()
	@IsString()
	preferredLocation?: string;

	@IsEnum(CandidateStatus)
	status: CandidateStatus;

	@IsOptional()
	@IsDateString()
	createdAt?: string;

	@IsOptional()
	@IsDateString()
	updatedAt?: string;
}
