import { IsUUID } from 'class-validator';

export class CandidateIdDto {
  @IsUUID('4', { message: 'Candidate ID must be a valid UUID' })
  id: string;
}
