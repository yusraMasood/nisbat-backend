import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	async sendPasswordResetEmail(
		email: string,
		code: string,
	): Promise<void> {
		// TODO: Replace with actual email sending service (e.g., SendGrid, AWS SES, Nodemailer)
		// For development, log to console
		this.logger.log(`Password reset OTP for ${email}: ${code}`);
		this.logger.log(
			`Email would be sent to ${email} with OTP code: ${code}`,
		);

		// In production, implement actual email sending:
		// Example with nodemailer:
		// await this.transporter.sendMail({
		//   to: email,
		//   subject: 'Password Reset Code',
		//   text: `Your password reset code is: ${code}`,
		//   html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
		// });
	}
}

