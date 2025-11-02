import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      // Parse DATABASE_URL (e.g., postgresql://user:password@host:port/database)
      const url = new URL(databaseUrl);

      return {
        type: 'postgres',
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1), // Remove leading '/'
        synchronize: false, // Not good for production, use migrations
        ssl: {
          rejectUnauthorized: false, // Required for Render and other cloud providers
        },
      };
    }

    // Fallback to individual environment variables (for local development)
    return {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: false, // Not good for production, use migrations
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    };
  },
);
