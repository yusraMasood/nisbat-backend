// Global test setup
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Candidate } from '../src/candidates/candidate.entity';

// Increase timeout for e2e tests
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  generateValidUUID: () => '123e4567-e89b-12d3-a456-426614174000',
  generateValidEmail: () =>
    `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
  generateValidPassword: () => 'Password123!',
  generateValidName: () => `Test User ${Date.now()}`,
  generateUniqueEmail: (prefix: string = 'test') =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
};

// Database cleanup utilities
global.databaseUtils = {
  async clearDatabase(dataSource: DataSource) {
    try {
      // Clear all tables in the correct order (respecting foreign key constraints)
      await dataSource.getRepository(Candidate).delete({});
      await dataSource.getRepository(User).delete({});
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  },
  async clearAndSynchronize(dataSource: DataSource) {
    try {
      await global.databaseUtils.clearDatabase(dataSource);
      await dataSource.synchronize(true); // Drop and recreate tables
    } catch (error) {
      console.error('❌ Database reset failed:', error);
    }
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global database cleanup before all tests
beforeAll(async () => {
  // This will be handled by individual test files that have access to the DataSource
});
