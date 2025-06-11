# 🧪 Test Guide

Complete guide for running and understanding the test structure of the Node.js Express PostgreSQL Starter application.

## 📁 Test Structure

Tests are separated by controller/functionality for easier maintenance and debugging:

```
test/
├── auth.test.js          # 🔐 Authentication endpoints
├── user.test.js          # 👤 User management & profile
├── health.test.js        # 🏥 Health & utility endpoints
├── authorization.test.js # 🔒 Authorization & access control
└── comprehensive.test.js # 🧪 Comprehensive integration tests
```

### 🔐 Authentication Tests (`auth.test.js`)
- **POST /v1/auth/register** - User registration
- **POST /v1/auth/login** - User login
- **POST /v1/auth/logout** - User logout with token blacklisting
- **POST /v1/auth/change-password** - Password change
- **POST /v1/auth/forgot-password** - Password reset request
- **POST /v1/auth/verify-email** - Email verification
- **POST /v1/auth/resend-verification** - Resend verification email

### 👤 User Tests (`user.test.js`)
- **GET /v1/users/profile** - Get user profile
- **PUT /v1/users/profile** - Update user profile
- **DELETE /v1/users/account** - Deactivate account
- **GET /v1/users** - Admin: List all users
- **POST /v1/users** - Admin: Create new user
- **GET /v1/users/:id** - Admin: Get user by ID
- **PUT /v1/users/:id** - Admin: Update user
- **DELETE /v1/users/:id** - Admin: Delete user

### 🏥 Health Tests (`health.test.js`)
- **GET /health** - Health check endpoint
- **GET /version** - Version information
- **404 Error Handling** - Non-existent routes
- **Error Handling** - Invalid JSON, missing headers
- **Performance Tests** - Response time checks
- **Security Headers** - CORS, security headers

### 🔒 Authorization Tests (`authorization.test.js`)
- **Admin-only Endpoints** - Access control verification
- **User Self-Access** - Users accessing their own data
- **Token Security** - Invalid/expired/blacklisted tokens
- **Role-Based Access Control (RBAC)** - Role verification
- **Security Edge Cases** - Header manipulation, injection prevention

## 🚀 Running Tests

### ⚠️ Important Prerequisites

Before running any tests, you **MUST** set up the test environment:

#### 1. Set NODE_ENV to test
```bash
export NODE_ENV=test
```

#### 2. Set up test database
```bash
npm run test:setup
```

This command will:
- Create the test database
- Run all migrations for the test environment
- Prepare the database schema for testing

### Running All Tests
```bash
# Run all test files
npm test

# Run tests by controller in sequence
npm run test:all
```

### Running Individual Tests
```bash
# Authentication tests only
npm run test:auth

# User management tests only
npm run test:user

# Health endpoints tests only
npm run test:health

# Authorization tests only
npm run test:authorization

# Comprehensive integration tests
npm run test:comprehensive
```

### Test with Watch Mode
```bash
# Run tests and watch for file changes
npm run test:watch
```

### Reset Test Database
```bash
# Reset test database (drop & recreate)
npm run test:reset
```

### Cleanup Test Database
```bash
# Drop test database
npm run test:teardown
```

## 📊 Test Coverage

### Authentication Controller
- ✅ **19 tests** covering all auth endpoints
- ✅ Valid/invalid credentials
- ✅ Token generation/validation
- ✅ Token blacklisting (logout)
- ✅ Password change/reset
- ✅ Email verification

### User Controller
- ✅ **25 tests** covering profile & admin management
- ✅ User profile CRUD operations
- ✅ Admin user management
- ✅ Pagination support
- ✅ Account deactivation
- ✅ Self-access vs admin access

### Health Controller
- ✅ **15 tests** covering health & utility
- ✅ Health check endpoint
- ✅ Version information
- ✅ Error handling (404, invalid JSON)
- ✅ Performance testing
- ✅ Security headers validation

### Authorization Controller
- ✅ **23 tests** covering access control
- ✅ Admin-only endpoint protection
- ✅ User self-access permissions
- ✅ Token security (invalid/expired/blacklisted)
- ✅ Role-based access control
- ✅ Security edge cases & injection prevention

## 🔧 Test Configuration

### Environment Variables
Tests use `NODE_ENV=test` and a separate database for testing.

### Database Setup
- Test database: `your_app_test`
- Uses the same migrations as development
- Automatic cleanup after each test suite

### Test Data
- Each test file uses isolated test data
- Automatic cleanup to prevent test interference
- Fresh tokens are created for each test requiring authentication

## 🐳 Testing with Docker

If you're using Docker for your application, you can still run tests locally:

```bash
# Ensure Docker containers are stopped to avoid port conflicts
sudo docker compose down

# Set up local test environment
export NODE_ENV=test
npm run test:setup

# Run tests locally
npm test
```

**Note**: Tests are designed to run against a local PostgreSQL instance, not the Docker PostgreSQL container.

## 📝 Writing New Tests

### Test File Template
```javascript
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app')
const db = require('../src/database/models').default

const { expect } = chai
chai.use(chaiHttp)

const { User, BlacklistedToken } = db

describe('🏷️ Your Controller Tests', () => {
  // Setup data
  before(async () => {
    // Create test data
  })

  // Cleanup
  after(async () => {
    // Clean test data
  })

  describe('Endpoint Group', () => {
    it('✅ should do something successfully', (done) => {
      chai.request(app)
        .get('/your-endpoint')
        .end((err, res) => {
          expect(res).to.have.status(200)
          done()
        })
    })

    it('❌ should handle error case', (done) => {
      chai.request(app)
        .post('/your-endpoint')
        .send({ invalid: 'data' })
        .end((err, res) => {
          expect(res).to.have.status(400)
          done()
        })
    })
  })
})
```

### Best Practices

1. **Always set NODE_ENV=test** before running tests
2. **Run test:setup** once before starting test development
3. **Use descriptive test names** with ✅ for success cases and ❌ for error cases
4. **Clean up test data** to prevent interference between tests
5. **Test both success and error scenarios**
6. **Use isolated test data** for each test file
7. **Include performance and security tests** where appropriate

## 🔍 Debugging Tests

### Common Issues

1. **Database connection errors**: Ensure `NODE_ENV=test` is set
2. **Migration errors**: Run `npm run test:setup` to initialize the test database
3. **Port conflicts**: Stop Docker containers if running tests locally
4. **Token authentication**: Ensure fresh tokens are generated for each test

### Verbose Output
```bash
# Run tests with verbose output
npm test -- --reporter spec

# Run specific test with debug info
NODE_ENV=test DEBUG=* npm run test:auth
```

### Database State Inspection
```bash
# Check test database exists
NODE_ENV=test npx sequelize-cli db:create --if-not-exists

# Check migrations status
NODE_ENV=test npx sequelize-cli db:migrate:status

# Reset if needed
npm run test:reset
```

This comprehensive test suite ensures your API is robust, secure, and ready for production deployment. 