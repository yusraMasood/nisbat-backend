import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateCandidateDto } from './create-candidate.dto';
import { UpdateCandidateDto } from './update-candidate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { Repository, Not, In } from 'typeorm';
import { Friend } from '../friends/friend.entity';
import { FriendStatus } from '../friends/friend.entity';
import { FileUploadService } from '../common/file-upload/file-upload.service';

@Injectable()
export class CandidatesService {
	constructor(
		@InjectRepository(Candidate)
		private readonly candidateRepository: Repository<Candidate>,
		@InjectRepository(Friend)
		private readonly friendRepository: Repository<Friend>,
		private readonly fileUploadService: FileUploadService,
	) { }
	public async getCandidates(userId: string): Promise<Candidate[]> {
		return await this.candidateRepository.find({ where: { userId } });
	}
	public async create(
		createCandidateDto: CreateCandidateDto,
		images: Express.Multer.File[],
		userId: string,
	): Promise<Candidate> {
		// Save uploaded image files if provided
		let imagePaths: string[] = [];
		if (images && images.length > 0) {
			imagePaths = images
				.map((image) => this.fileUploadService.saveFile(image, 'candidates'))
				.filter((path): path is string => path !== null);
		}

		const candidate = this.candidateRepository.create({
			...createCandidateDto,
			images: imagePaths.length > 0 ? imagePaths : undefined,
			userId,
		});

		return await this.candidateRepository.save(candidate);
	}
	async getCandidate(id: string, userId: string): Promise<Candidate> {
		const candidate = await this.candidateRepository.findOne({ where: { id } });
		if (!candidate) throw new NotFoundException(`Candidate ${id} not found`);
		if (candidate.userId !== userId) {
			throw new ForbiddenException('You are not allowed to do this action');
		}
		return candidate;
	}

	async update(
		id: string,
		dto: UpdateCandidateDto,
		userId: string,
	): Promise<Candidate> {
		const candidate = await this.getCandidate(id, userId);
		console.log(candidate.userId, userId);
		Object.assign(candidate, dto);
		return this.candidateRepository.save(candidate);
	}
	async remove(id: string, userId: string): Promise<void> {
		const candidate = await this.getCandidate(id, userId);

		// Delete associated image files
		if (candidate.images && Array.isArray(candidate.images)) {
			const imageArray: string[] = candidate.images as string[];
			if (imageArray.length > 0) {
				imageArray.forEach((imagePath: string) => {
					if (imagePath) {
						this.fileUploadService.deleteFile(imagePath);
					}
				});
			}
		}

		await this.candidateRepository.remove(candidate);
	}

	async findAllExceptUser(userId: string): Promise<Candidate[]> {
		return this.candidateRepository.find({
			where: { userId: Not(userId) },
		});
	}

	async getHomeFeed(userId: string): Promise<Candidate[]> {
		// Get all accepted friends (both as sender and receiver)
		const friends = await this.friendRepository.find({
			where: [
				{ senderId: userId, status: FriendStatus.ACCEPTED },
				{ receiverId: userId, status: FriendStatus.ACCEPTED },
			],
		});

		// Extract friend IDs
		const friendIds: string[] = [];
		friends.forEach((friend) => {
			if (friend.senderId === userId) {
				friendIds.push(friend.receiverId);
			} else {
				friendIds.push(friend.senderId);
			}
		});

		// If user has no friends, return empty array
		if (friendIds.length === 0) {
			return [];
		}

		// Get candidates from friends only
		return this.candidateRepository.find({
			where: {
				userId: In(friendIds),
			},
			relations: ['user'],
			order: { createdAt: 'DESC' },
		});
	}
}
