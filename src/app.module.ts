import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CandidatesModule } from './candidates/candidates.module';
import { Candidate } from './candidates/candidate.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig } from './config/database.config';
import { appConfigSchema } from './config/config.types';
import { TypedConfigService } from './config/typed-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { PasswordReset } from './users/password-reset.entity';
import { authConfig } from './config/auth.config';
import { usersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { Friend } from './friends/friend.entity';
import { ChatModule } from './chat/chat.module';
import { Message } from './chat/message.entity';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [typeOrmConfig, authConfig],
			validationSchema: appConfigSchema,
			validationOptions: {
				abortEarly: true, //if theres any problem with environment variable it will make sure to throw an error
			},
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: TypedConfigService) => ({
				...configService.get('database'),
				entities: [Candidate, User, PasswordReset, Friend, Message],
				autoLoadEntities: true,
			}),
		}),

		CandidatesModule,
		usersModule,
		FriendsModule,
		ChatModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: TypedConfigService,
			useExisting: ConfigService,
		},
	],
})
export class AppModule { }
