import { validate } from 'class-validator';
import {
  CreateCandidateDto,
  Gender,
  MaritalStatus,
  CandidateStatus,
} from './create-candidate.dto';

describe('CreateCandidateDto', () => {
  let dto: CreateCandidateDto;

  beforeEach(() => {
    dto = new CreateCandidateDto();
  });

  describe('fullName validation', () => {
    it('should pass with valid full name', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const nameErrors = errors.filter(
        (error) => error.property === 'fullName',
      );
      expect(nameErrors).toHaveLength(0);
    });

    it('should fail with empty full name', async () => {
      dto.fullName = '';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const nameErrors = errors.filter(
        (error) => error.property === 'fullName',
      );
      expect(nameErrors).toHaveLength(1);
      expect(nameErrors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  describe('gender validation', () => {
    it('should pass with valid MALE gender', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const genderErrors = errors.filter(
        (error) => error.property === 'gender',
      );
      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with valid FEMALE gender', async () => {
      dto.fullName = 'Jane Doe';
      dto.gender = Gender.FEMALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const genderErrors = errors.filter(
        (error) => error.property === 'gender',
      );
      expect(genderErrors).toHaveLength(0);
    });

    it('should pass with valid OTHER gender', async () => {
      dto.fullName = 'Alex Doe';
      dto.gender = Gender.OTHER;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const genderErrors = errors.filter(
        (error) => error.property === 'gender',
      );
      expect(genderErrors).toHaveLength(0);
    });

    it('should fail with invalid gender', async () => {
      dto.fullName = 'John Doe';
      dto.gender = 'INVALID_GENDER' as Gender;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const genderErrors = errors.filter(
        (error) => error.property === 'gender',
      );
      expect(genderErrors).toHaveLength(1);
      expect(genderErrors[0].constraints?.isEnum).toBeDefined();
    });
  });

  describe('dob validation', () => {
    it('should pass with valid date string', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const dobErrors = errors.filter((error) => error.property === 'dob');
      expect(dobErrors).toHaveLength(0);
    });

    it('should fail with invalid date string', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = 'invalid-date';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const dobErrors = errors.filter((error) => error.property === 'dob');
      expect(dobErrors).toHaveLength(1);
      expect(dobErrors[0].constraints?.isDateString).toBeDefined();
    });
  });

  describe('maritalStatus validation', () => {
    it('should pass with valid SINGLE status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'maritalStatus',
      );
      expect(statusErrors).toHaveLength(0);
    });

    it('should pass with valid MARRIED status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.MARRIED;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'maritalStatus',
      );
      expect(statusErrors).toHaveLength(0);
    });

    it('should fail with invalid marital status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = 'INVALID_STATUS' as MaritalStatus;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'maritalStatus',
      );
      expect(statusErrors).toHaveLength(1);
      expect(statusErrors[0].constraints?.isEnum).toBeDefined();
    });
  });

  describe('religion validation', () => {
    it('should pass with valid religion', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const religionErrors = errors.filter(
        (error) => error.property === 'religion',
      );
      expect(religionErrors).toHaveLength(0);
    });

    it('should fail with empty religion', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = '';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const religionErrors = errors.filter(
        (error) => error.property === 'religion',
      );
      expect(religionErrors).toHaveLength(1);
      //expect(religionErrors[0].constraints?.isString).toBeDefined();
      expect(religionErrors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  describe('status validation', () => {
    it('should pass with valid PENDING status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'status',
      );
      expect(statusErrors).toHaveLength(0);
    });

    it('should pass with valid APPROVED status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.APPROVED;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'status',
      );
      expect(statusErrors).toHaveLength(0);
    });

    it('should pass with valid REJECTED status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.REJECTED;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'status',
      );
      expect(statusErrors).toHaveLength(0);
    });

    it('should fail with invalid status', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = 'INVALID_STATUS' as CandidateStatus;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      const statusErrors = errors.filter(
        (error) => error.property === 'status',
      );
      expect(statusErrors).toHaveLength(1);
      expect(statusErrors[0].constraints?.isEnum).toBeDefined();
    });
  });

  describe('optional fields validation', () => {
    it('should pass with all optional fields', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';
      dto.image = 'image.jpg';
      dto.height = '5\'10"';
      dto.caste = 'Syed';
      dto.language = 'Urdu';
      dto.education = 'Bachelor';
      dto.job = 'Engineer';
      dto.income = '50000';
      dto.preferredAge = '25-30';
      dto.preferredHeight = '5\'6"-6\'0"';
      dto.preferredEducation = 'Bachelor';
      dto.preferredCaste = 'Any';
      dto.preferredLanguage = 'Urdu';
      dto.otherPreferred = 'Good character';
      dto.preferredLocation = 'Karachi';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass without optional fields', async () => {
      dto.fullName = 'John Doe';
      dto.gender = Gender.MALE;
      dto.dob = '1990-01-01';
      dto.maritalStatus = MaritalStatus.SINGLE;
      dto.religion = 'Islam';
      dto.status = CandidateStatus.PENDING;
      dto.userId = 'user-123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
