import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { Friend } from './friend.entity';
import { User } from '../users/user.entity';
import { AuthConfig } from '../config/auth.config';
import { TypedConfigService } from '../config/typed-config.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Friend, User]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: TypedConfigService) => ({
				secret: config.get<AuthConfig>('auth')?.jwt.secret,
				signOptions: {
					expiresIn: config.get<AuthConfig>('auth')?.jwt.expiresIn,
				},
			}),
		}),
	],
	controllers: [FriendsController],
	providers: [FriendsService],
	exports: [FriendsService],
})
export class FriendsModule { }
