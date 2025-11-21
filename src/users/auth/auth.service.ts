import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';
import { RegisterResponse } from './register.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PasswordReset } from '../password-reset.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
	private readonly OTP_EXPIRY_MINUTES = 15;
	private readonly OTP_LENGTH = 6;

	constructor(
		private readonly userService: UserService,
		private readonly jwtToken: JwtService,
		private readonly passwordService: PasswordService,
		@InjectRepository(PasswordReset)
		private readonly passwordResetRepository: Repository<PasswordReset>,
		private readonly emailService: EmailService,
	) { }

	public async register(
		createUserDto: CreateUserDto,
	): Promise<RegisterResponse> {
		const existingUser = await this.userService.findOneByEmail(
			createUserDto.email,
		);
		if (existingUser) {
			throw new ConflictException('Email already exists');
		}
		const user = await this.userService.create(createUserDto);
		const accessToken = await this.generateToken(user);

		//return token/user with token/ only user

		return new RegisterResponse({ user, accessToken });
	}
	public async login(email: string, password: string): Promise<string> {
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			throw new UnauthorizedException('Invalid Credentials');
		}
		if (!(await this.passwordService.verify(password, user.password))) {
			throw new UnauthorizedException('Invalid Password');
		}
		return await this.generateToken(user);
	}
	public async forgotPassword(email: string): Promise<{ message: string }> {
		const user = await this.userService.findOneByEmail(email);
		if (!user) {
			// For security, don't reveal if email exists or not
			return { message: 'If the email exists, a password reset code has been sent' };
		}

		// Generate 6-digit OTP
		const code = this.generateOTP();

		// Set expiration time (15 minutes from now)
		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

		// Invalidate any existing unused OTPs for this email
		await this.passwordResetRepository.update(
			{ email, used: false },
			{ used: true },
		);

		// Save new OTP to database
		const passwordReset = this.passwordResetRepository.create({
			email,
			code,
			expiresAt,
			used: false,
		});
		await this.passwordResetRepository.save(passwordReset);

		// Send email with OTP
		await this.emailService.sendPasswordResetEmail(email, code);

		// For security, don't reveal if email exists or not
		return { message: 'If the email exists, a password reset code has been sent' };
	}

	public async verifyCode(
		email: string,
		code: string,
	): Promise<{ message: string; valid: boolean }> {
		// Find the most recent unused OTP for this email
		const passwordReset = await this.passwordResetRepository.findOne({
			where: { email, code, used: false },
			order: { createdAt: 'DESC' },
		});

		if (!passwordReset) {
			throw new BadRequestException('Invalid or expired code');
		}

		// Check if code has expired
		if (new Date() > passwordReset.expiresAt) {
			// Mark as used to prevent future attempts
			passwordReset.used = true;
			await this.passwordResetRepository.save(passwordReset);
			throw new BadRequestException('Code has expired');
		}

		return { message: 'Code is valid', valid: true };
	}

	public async resetPassword(
		email: string,
		code: string,
		newPassword: string,
	): Promise<{ message: string }> {
		// Find the most recent unused OTP for this email
		const passwordReset = await this.passwordResetRepository.findOne({
			where: { email, code, used: false },
			order: { createdAt: 'DESC' },
		});

		if (!passwordReset) {
			throw new BadRequestException('Invalid or expired code');
		}

		// Check if code has expired
		if (new Date() > passwordReset.expiresAt) {
			// Mark as used to prevent future attempts
			passwordReset.used = true;
			await this.passwordResetRepository.save(passwordReset);
			throw new BadRequestException('Code has expired');
		}

		// Update user password
		await this.userService.updatePasswordByEmail(email, newPassword);

		// Mark OTP as used
		passwordReset.used = true;
		await this.passwordResetRepository.save(passwordReset);

		// Clean up expired OTPs (optional, can be done via cron job)
		await this.cleanupExpiredOTPs();

		return { message: 'Password has been reset successfully' };
	}

	private generateOTP(): string {
		// Generate 6-digit numeric OTP
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	private async cleanupExpiredOTPs(): Promise<void> {
		// Delete expired OTPs older than 1 hour
		const oneHourAgo = new Date();
		oneHourAgo.setHours(oneHourAgo.getHours() - 1);

		await this.passwordResetRepository.delete({
			expiresAt: LessThan(oneHourAgo),
		});
	}

	private async generateToken(user: User): Promise<string> {
		const payload = { sub: user.id, name: user.name, roles: user.roles };
		return await this.jwtToken.signAsync(payload);
	}
}

{
	/*
	
	1. User Registeration
	 -Make sure User doesnt exist yet
		-store the user
		-(optional) generate the token 
	2. Generating token
	*/
}
