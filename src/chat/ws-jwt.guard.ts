import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { TypedConfigService } from '../config/typed-config.service';
import { JwtPayload } from './chat.types';
import { AuthConfig } from '../config/auth.config';

@Injectable()
export class WsJwtGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: TypedConfigService,
	) { }

	canActivate(context: ExecutionContext): boolean {
		const client: Socket = context.switchToWs().getClient();
		const token =
			(client.handshake.auth?.token as string) ||
			client.handshake.headers?.authorization?.replace('Bearer ', '');

		if (!token) {
			return false;
		}

		try {
			const authConfig = this.configService.get<AuthConfig>('auth');
			if (!authConfig) {
				return false;
			}
			const secret = authConfig.jwt.secret;
			const payload = this.jwtService.verify(token, {
				secret,
			});
			client.data.user = payload;
			return true;
		} catch {
			return false;
		}
	}
}
