import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'Password123!';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(typeof hashedPassword).toBe('string');
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'Password123!';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verify', () => {
    it('should verify a correct password', async () => {
      const password = 'Password123!';
      const hashedPassword = await service.hash(password);

      const result = await service.verify(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'Password123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await service.hash(password);

      const result = await service.verify(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });
});
