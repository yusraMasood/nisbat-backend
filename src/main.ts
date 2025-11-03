import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Set global prefix for all API routes
	app.setGlobalPrefix('api');

	// Validation
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);

	// Swagger Setup 🧩
	const config = new DocumentBuilder()
		.setTitle('Nisbat API')
		.setDescription('Nisbat backend API documentation')
		.setVersion('1.0')
		.addBearerAuth() // Adds Authorization: Bearer token support
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document); // Will be available at /api/docs due to global prefix

	const port = process.env.PORT ?? 3000;
	await app.listen(port);
	console.log(`🚀 Server running at: http://localhost:${port}/api`);
	console.log(
		`📘 Swagger docs available at: http://localhost:${port}/api/docs`,
	);
}
bootstrap();
