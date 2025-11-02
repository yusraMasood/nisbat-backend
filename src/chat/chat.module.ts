import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message } from './message.entity';
import { User } from '../users/user.entity';
import { WsJwtGuard } from './ws-jwt.guard';
import { TypedConfigService } from '../config/typed-config.service';
import { AuthConfig } from '../config/auth.config';

@Module({
	imports: [
		TypeOrmModule.forFeature([Message, User]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: TypedConfigService) => {
				const authConfig = configService.get<AuthConfig>('auth');
				if (!authConfig) {
					throw new Error('Auth configuration not found');
				}
				return {
					secret: authConfig.jwt.secret,
					signOptions: {
						expiresIn: authConfig.jwt.expiresIn ?? '60m',
					},
				};
			},
		}),
	],
	controllers: [ChatController],
	providers: [
		ChatGateway,
		ChatService,
		WsJwtGuard,
		{
			provide: TypedConfigService,
			useExisting: ConfigService,
		},
	],
	exports: [ChatService],
})
export class ChatModule { }
