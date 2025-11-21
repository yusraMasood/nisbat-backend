import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	fullName?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	// profileImage is handled via file upload, not in DTO

	@IsOptional()
	@IsString()
	religion?: string;

	@IsOptional()
	@IsString()
	subReligion?: string;

	@IsOptional()
	@IsString()
	languages?: string;

	@IsOptional()
	@IsString()
	caste?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsString()
	city?: string;

	@IsOptional()
	@IsString()
	country?: string;

	@IsOptional()
	@IsString()
	contactMethod?: string;
}
