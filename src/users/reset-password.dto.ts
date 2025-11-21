import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Length,
	Matches,
	MinLength,
} from 'class-validator';

export class ResetPasswordDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@Length(6, 6, { message: 'Code must be exactly 6 characters' })
	code: string;

	@IsNotEmpty()
	@MinLength(6)
	@Matches(/[A-Z]/, {
		message: 'Password must contain at least one uppercase letter',
	})
	@Matches(/[0-9]/, {
		message: 'Password must contain at least one number',
	})
	@Matches(/[^A-Za-z0-9]/, {
		message: 'Password must contain at least one special character',
	})
	password: string;
}
