import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './create-candidate.dto';
import { UpdateCandidateDto } from './update-candidate.dto';
import { CandidateIdDto } from './params/candidate-id.dto';
import { Candidate } from './candidate.entity';
import { CurrentUserId } from '../users/decorators/current-user-id.decorator';
import { AuthGuard } from '../users/auth.guard';
import type { AuthRequest } from '../users/auth.request';

@Controller('candidates')
export class CandidatesController {
	constructor(private readonly candidatesService: CandidatesService) { }

	@Get('home')
	@UseGuards(AuthGuard)
	async getHomeFeed(
		@Req() req: AuthRequest,
	): Promise<Candidate[]> {
		return this.candidatesService.getHomeFeed(req.user.sub);
	}

	@Get()
	getCandidates(@CurrentUserId() userId: string): Promise<Candidate[]> {
		return this.candidatesService.getCandidates(userId);
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
	getCandidate(
		@Param() params: CandidateIdDto,
		@CurrentUserId() userId: string,
	): Promise<Candidate> {
		return this.candidatesService.getCandidate(params.id, userId);
	}
	@Patch(':id')
	async update(
		@Param() params: CandidateIdDto,
		@Body() updateCandidate: UpdateCandidateDto,
		@CurrentUserId() userId: string,
	): Promise<Candidate> {
		console.log(updateCandidate);
		return await this.candidatesService.update(
			params.id,
			updateCandidate,
			userId,
		);
	}
	@Delete(':id')
	async remove(
		@Param() params: CandidateIdDto,
		@CurrentUserId() userId: string,
	): Promise<void> {
		return await this.candidatesService.remove(params.id, userId);
	}
}
