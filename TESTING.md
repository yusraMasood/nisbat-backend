# Testing Guide

This document provides comprehensive information about the testing setup and strategies for the Nisbat Backend application.

## Test Structure

The application follows a comprehensive testing strategy with three main types of tests:

### 1. Unit Tests (`*.spec.ts`)
- **Location**: `src/**/*.spec.ts`
- **Purpose**: Test individual components in isolation
- **Coverage**: Services, controllers, DTOs, guards, decorators

### 2. Integration Tests (`*.e2e-spec.ts`)
- **Location**: `test/**/*.e2e-spec.ts`
- **Purpose**: Test complete workflows and API endpoints
- **Coverage**: Full request/response cycles, authentication flows

### 3. DTO Validation Tests
- **Purpose**: Ensure data validation works correctly
- **Coverage**: All DTOs with comprehensive validation scenarios

## Test Categories

### Authentication Tests
- **AuthController**: Registration, login, profile access, admin endpoints
- **AuthService**: User registration, authentication, token generation
- **AuthGuard**: JWT token validation and user authentication
- **RolesGuard**: Role-based access control
- **PasswordService**: Password hashing and verification

### User Management Tests
- **UserService**: User CRUD operations, email validation
- **CreateUserDto**: User registration data validation
- **UserIdDto**: Parameter validation for user operations

### Candidate Management Tests
- **CandidatesController**: CRUD operations for candidates
- **CandidatesService**: Business logic for candidate management
- **CreateCandidateDto**: Candidate data validation
- **UpdateCandidateDto**: Candidate update validation
- **CandidateIdDto**: Parameter validation for candidate operations

### Application Tests
- **AppController**: Basic application endpoints
- **AppService**: Core application services
- **Main**: Application bootstrap and configuration

## Running Tests

### All Tests
```bash
npm run test:all
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

### Debug Mode
```bash
npm run test:debug
```

## Test Configuration

### Jest Configuration
- **Unit Tests**: `package.json` jest configuration
- **E2E Tests**: `test/jest-e2e.json`
- **Setup**: `test/setup.ts` for global test configuration

### Test Environment
- **Database**: Uses test database configuration
- **Authentication**: Mock JWT tokens for testing
- **Validation**: Full validation pipeline testing

## DTO Validation

All DTOs include comprehensive validation tests covering:

### CreateUserDto
- Email format validation
- Password strength requirements (uppercase, number, special character, min length)
- Name validation
- Role validation (FAMILY, MATCHMAKER)

### CreateCandidateDto
- Required field validation (fullName, gender, dob, maritalStatus, religion, status)
- Enum validation (Gender, MaritalStatus, CandidateStatus)
- Date format validation
- Optional field validation

### Parameter DTOs
- UUID v4 validation for all ID parameters
- Proper error messages for invalid formats

## Test Data

### Mock Data
- Consistent test data across all test files
- Realistic user and candidate data
- Valid UUIDs and email addresses

### Test Utilities
- Global test utilities in `test/setup.ts`
- Reusable mock objects and functions
- Consistent test data generation

## Best Practices

### Test Organization
- One test file per source file
- Descriptive test names
- Grouped by functionality
- Clear setup and teardown

### Mocking Strategy
- Mock external dependencies
- Use realistic mock data
- Test error scenarios
- Verify mock interactions

### Assertions
- Test both success and failure cases
- Verify return values and side effects
- Check error messages and status codes
- Validate data transformations

## Coverage Goals

- **Unit Tests**: 90%+ coverage for services and controllers
- **Integration Tests**: 100% coverage for API endpoints
- **DTO Tests**: 100% coverage for validation scenarios
- **Guard Tests**: 100% coverage for authentication and authorization

## Continuous Integration

Tests are designed to run in CI/CD pipelines with:
- Fast execution times
- No external dependencies
- Consistent results
- Clear failure reporting

## Debugging Tests

### Common Issues
1. **Database Connection**: Ensure test database is properly configured
2. **Authentication**: Verify JWT token generation and validation
3. **Validation**: Check DTO validation rules and error messages
4. **Mocking**: Ensure all dependencies are properly mocked

### Debug Commands
```bash
# Run specific test file
npm test -- auth.controller.spec.ts

# Run tests with verbose output
npm test -- --verbose

# Run tests matching pattern
npm test -- --testNamePattern="should register"
```

## Test Maintenance

### Adding New Tests
1. Follow existing naming conventions
2. Include both positive and negative test cases
3. Mock external dependencies
4. Add appropriate assertions
5. Update documentation

### Updating Tests
1. Maintain backward compatibility
2. Update mock data when needed
3. Verify test coverage
4. Run full test suite before committing

This testing setup ensures the application is robust, reliable, and maintainable with comprehensive coverage of all functionality.
