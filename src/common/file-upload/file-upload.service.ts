import { Injectable, BadRequestException } from '@nestjs/common';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { randomBytes } from 'crypto';

@Injectable()
export class FileUploadService {
	private readonly uploadDir = 'uploads';
	private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
	private readonly allowedMimeTypes = [
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
		'image/webp',
	];

	constructor() {
		// Ensure upload directory exists
		this.ensureUploadDirectoryExists();
	}

	private ensureUploadDirectoryExists(): void {
		const dirs = [
			this.uploadDir,
			`${this.uploadDir}/candidates`,
			`${this.uploadDir}/profiles`,
		];
		dirs.forEach((dir) => {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		});
	}

	private validateFile(file: Express.Multer.File): void {
		if (!file) {
			throw new BadRequestException('No file provided');
		}

		if (file.size > this.maxFileSize) {
			throw new BadRequestException(
				`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`,
			);
		}

		if (!this.allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException(
				`Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
			);
		}
	}

	saveFile(
		file: Express.Multer.File,
		subfolder: 'candidates' | 'profiles',
	): string | null {
		if (!file) {
			return null;
		}

		this.validateFile(file);

		// Generate unique filename
		const fileExt = extname(file.originalname);
		const uniqueId = randomBytes(16).toString('hex');
		const fileName = `${uniqueId}${fileExt}`;
		const filePath = join(this.uploadDir, subfolder, fileName);

		// Save file
		writeFileSync(filePath, file.buffer);

		// Return relative path that can be stored in database
		return `/${this.uploadDir}/${subfolder}/${fileName}`;
	}

	deleteFile(filePath: string): void {
		if (!filePath) {
			return;
		}

		// Remove leading slash if present
		const pathToDelete = filePath.startsWith('/')
			? filePath.slice(1)
			: filePath;

		if (existsSync(pathToDelete)) {
			try {
				unlinkSync(pathToDelete);
			} catch (error) {
				console.error(`Error deleting file ${pathToDelete}:`, error);
			}
		}
	}

	getFullPath(relativePath: string): string | null {
		if (!relativePath) {
			return null;
		}
		// Return path with leading slash for URL access
		return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
	}
}
