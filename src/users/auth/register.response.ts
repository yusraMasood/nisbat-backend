import { Expose, Type } from 'class-transformer';
import { User } from '../user.entity';

export class RegisterResponse {
  @Expose()
  @Type(() => User)
  user: User;

  @Expose()
  accessToken: string;

  constructor(partial: Partial<RegisterResponse>) {
    Object.assign(this, partial);
  }
}
