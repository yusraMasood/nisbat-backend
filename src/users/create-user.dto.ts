import { IsEmail, IsIn, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { UserRole } from './role.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

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

  @IsNotEmpty()
  @IsIn([UserRole.FAMILY, UserRole.MATCHMAKER], {
    message: 'Role must be either "family" or "matchmaker"',
  })
  userRole: UserRole;
}
