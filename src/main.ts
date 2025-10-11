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
		.setDescription('API documentation for the Nisbat backend')
		.setVersion('1.0')
		.addBearerAuth() // Adds Authorization: Bearer token support
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document); // Route: http://localhost:3000/api

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
