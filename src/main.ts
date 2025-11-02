import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Validation
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);

	// Swagger Setup 🧩
	const config = new DocumentBuilder()
		.setTitle('Nisbat API Docs')
		.setDescription(
			'API documentation for the Nisbat backend\n\n' +
			'🔐 Authentication: Click "Authorize" and enter your JWT token\n' +
			'💬 Chat: REST API endpoints + WebSocket support for real-time messaging\n' +
			'📖 See SWAGGER_CHAT_GUIDE.md for detailed chat documentation',
		)
		.setVersion('1.0')
		.addBearerAuth() // Adds Authorization: Bearer token support
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document); // Route: http://localhost:3000/api

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
