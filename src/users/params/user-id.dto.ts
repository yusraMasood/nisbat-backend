import { IsUUID } from 'class-validator';

export class UserIdDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  id: string;
}
