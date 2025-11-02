import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	phoneNumber: string;

	@IsNotEmpty()
	@MinLength(6)
	@Matches(/[A-Z]/, {
		message: 'Password must contain atleast one uppercase letter',
	})
	@Matches(/[0-9]/, {
		message: 'Password must contain atleast one number',
	})
	@Matches(/[^A-Za-z0-9]/, {
		message: 'Password must contain atleast one special character',
	})
	password: string;
}
