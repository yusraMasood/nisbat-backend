import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './create-candidate.dto';
import { Candidate } from './candidate.entity';
import { CurrentUserId } from 'src/users/decorators/current-user-id.decorator';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  getCandidates(): Promise<Candidate[]> {
    return this.candidatesService.getCandidates();
  }
  @Post()
  public async create(
    @Body() createCandidate: CreateCandidateDto,
    @CurrentUserId() userId: string,
  ): Promise<Candidate> {
    return await this.candidatesService.create({
      ...createCandidate,
      userId,
    });
  }
  @Get(':id')
  getCandidate(@Param('id') id: string): Promise<Candidate> {
    return this.candidatesService.getCandidate(id);
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCandidate: Partial<CreateCandidateDto>,
  ): Promise<Candidate> {
    return await this.candidatesService.update(id, updateCandidate);
  }
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.candidatesService.remove(id);
  }
}
