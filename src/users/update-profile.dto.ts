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

	@IsOptional()
	@IsString()
	profileImage?: string | null;

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

