import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Main Application Bootstrap', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create the application', () => {
    expect(app).toBeDefined();
  });

  it('should have the correct application type', () => {
    expect(app).toBeInstanceOf(Object);
  });

  it('should be able to get the HTTP adapter', () => {
    const httpAdapter = app.getHttpAdapter();
    expect(httpAdapter).toBeDefined();
  });
});
