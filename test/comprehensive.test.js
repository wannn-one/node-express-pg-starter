const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app')
const db = require('../src/database/models').default

const { expect } = chai
chai.use(chaiHttp)

const { User, BlacklistedToken } = db

describe('🧪 Comprehensive API Tests', () => {
  let userToken
  let adminToken
  let testUserId
  let adminUserId
  let createdUserId

  // Test data - using unique emails to avoid conflicts
  const testUser = {
    email: 'comptest@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  }

  const adminUser = {
    email: 'compadmin@example.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  }

  const newUserData = {
    email: 'compnewuser@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User'
  }

  // Setup: Clean database and create test users
  before(async () => {
    // Clean up
    await User.destroy({ where: {}, force: true })
    await BlacklistedToken.destroy({ where: {}, force: true })

    // Create admin user
    const admin = await User.create({
      ...adminUser,
      isEmailVerified: true
    })
    adminUserId = admin.id

    // Create regular user
    const user = await User.create({
      ...testUser,
      isEmailVerified: true
    })
    testUserId = user.id
  })

  // Cleanup after all tests
  after(async () => {
    await User.destroy({ where: {}, force: true })
    await BlacklistedToken.destroy({ where: {}, force: true })
  })

  describe('🔐 Authentication Endpoints', () => {
    
    describe('POST /v1/auth/register', () => {
      it('✅ should register a new user successfully', function(done) {
        this.timeout(5000) // Increase timeout for email sending
        chai.request(app)
          .post('/v1/auth/register')
          .send(newUserData)
          .end((err, res) => {
            expect(res).to.have.status(201)
            expect(res.body).to.have.property('success', true)
            expect(res.body).to.have.property('data')
            expect(res.body.data).to.have.property('user')
            expect(res.body.data).to.have.property('token')
            expect(res.body.data.user.email).to.equal(newUserData.email)
            expect(res.body.data.user).to.not.have.property('password')
            done()
          })
      })

      it('❌ should not register user with invalid email', (done) => {
        chai.request(app)
          .post('/v1/auth/register')
          .send({
            ...newUserData,
            email: 'invalid-email'
          })
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not register user with short password', (done) => {
        chai.request(app)
          .post('/v1/auth/register')
          .send({
            ...newUserData,
            email: 'test2@example.com',
            password: '123'
          })
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not register user with duplicate email', (done) => {
        chai.request(app)
          .post('/v1/auth/register')
          .send(testUser)
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            expect(res.body.message).to.contain('already exists')
            done()
          })
      })
    })

    describe('POST /v1/auth/login', () => {
      it('✅ should login with valid credentials', (done) => {
        chai.request(app)
          .post('/v1/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body).to.have.property('data')
            expect(res.body.data).to.have.property('user')
            expect(res.body.data).to.have.property('token')
            userToken = res.body.data.token
            done()
          })
      })

      it('✅ should login admin user', (done) => {
        chai.request(app)
          .post('/v1/auth/login')
          .send({
            email: adminUser.email,
            password: adminUser.password
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            adminToken = res.body.data.token
            done()
          })
      })

      it('❌ should not login with invalid credentials', (done) => {
        chai.request(app)
          .post('/v1/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword'
          })
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not login with non-existent user', (done) => {
        chai.request(app)
          .post('/v1/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('POST /v1/auth/logout', () => {
      let tempToken

      before((done) => {
        // Get a fresh token for logout test
        chai.request(app)
          .post('/v1/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
          .end((err, res) => {
            tempToken = res.body.data.token
            done()
          })
      })

      it('✅ should logout successfully with valid token', (done) => {
        chai.request(app)
          .post('/v1/auth/logout')
          .set('Authorization', `Bearer ${tempToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.message).to.contain('Logout successful')
            done()
          })
      })

      it('❌ should not logout without token', (done) => {
        chai.request(app)
          .post('/v1/auth/logout')
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not access protected route with blacklisted token', (done) => {
        chai.request(app)
          .get('/v1/users/profile')
          .set('Authorization', `Bearer ${tempToken}`)
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            expect(res.body.message).to.contain('invalidated')
            done()
          })
      })
    })

    describe('POST /v1/auth/change-password', () => {
      it('✅ should change password successfully', (done) => {
        // Create a dedicated user for password change test
        chai.request(app)
          .post('/v1/auth/register')
          .send({
            email: `passwordchange-${Date.now()}@example.com`,
            password: 'originalpass123',
            firstName: 'Password',
            lastName: 'Change'
          })
          .end((err, registerRes) => {
            const changeToken = registerRes.body.data.token
            
            chai.request(app)
              .post('/v1/auth/change-password')
              .set('Authorization', `Bearer ${changeToken}`)
              .send({
                currentPassword: 'originalpass123',
                newPassword: 'newpassword123'
              })
              .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('success', true)
                done()
              })
          })
      })

      it('❌ should not change password with wrong current password', (done) => {
        // Create another dedicated user for this test
        chai.request(app)
          .post('/v1/auth/register')
          .send({
            email: `wrongpass-${Date.now()}@example.com`,
            password: 'correctpass123',
            firstName: 'Wrong',
            lastName: 'Password'
          })
          .end((err, registerRes) => {
            const wrongToken = registerRes.body.data.token
            
            chai.request(app)
              .post('/v1/auth/change-password')
              .set('Authorization', `Bearer ${wrongToken}`)
              .send({
                currentPassword: 'wrongpassword',
                newPassword: 'newpassword123'
              })
              .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.have.property('success', false)
                done()
              })
          })
      })
    })

    describe('POST /v1/auth/forgot-password', () => {
      it('✅ should request password reset for existing email', function(done) {
        this.timeout(5000) // Increase timeout for email sending
        chai.request(app)
          .post('/v1/auth/forgot-password')
          .send({
            email: testUser.email
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.message).to.contain('Password reset')
            done()
          })
      })

      it('✅ should return success even for non-existent email (security)', (done) => {
        chai.request(app)
          .post('/v1/auth/forgot-password')
          .send({
            email: 'nonexistent@example.com'
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            done()
          })
      })
    })
  })

  describe('👤 User Profile Endpoints', () => {
    let validUserToken

    before((done) => {
      // Create a dedicated user for profile tests
      chai.request(app)
        .post('/v1/auth/register')
        .send({
          email: `profile-${Date.now()}@example.com`,
          password: 'password123',
          firstName: 'Profile',
          lastName: 'User'
        })
        .end((err, res) => {
          validUserToken = res.body.data.token
          done()
        })
    })
    
    describe('GET /v1/users/profile', () => {
      it('✅ should get user profile successfully', (done) => {
        chai.request(app)
          .get('/v1/users/profile')
          .set('Authorization', `Bearer ${validUserToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data).to.have.property('user')
            expect(res.body.data.user).to.not.have.property('password')
            done()
          })
      })

      it('❌ should not get profile without token', (done) => {
        chai.request(app)
          .get('/v1/users/profile')
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('PUT /v1/users/profile', () => {
      it('✅ should update profile successfully', (done) => {
        chai.request(app)
          .put('/v1/users/profile')
          .set('Authorization', `Bearer ${validUserToken}`)
          .send({
            firstName: 'Updated',
            lastName: 'Name'
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.firstName).to.equal('Updated')
            expect(res.body.data.user.lastName).to.equal('Name')
            done()
          })
      })

      it('❌ should not update profile with invalid data', (done) => {
        chai.request(app)
          .put('/v1/users/profile')
          .set('Authorization', `Bearer ${validUserToken}`)
          .send({
            firstName: 'A' // Too short
          })
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('DELETE /v1/users/account', () => {
      it('✅ should deactivate account successfully', (done) => {
        // Create a dedicated user for deletion test to avoid affecting other tests
        chai.request(app)
          .post('/v1/auth/register')
          .send({
            email: `deletetest-${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Delete',
            lastName: 'Test'
          })
          .end((err, registerRes) => {
            const deleteToken = registerRes.body.data.token
            chai.request(app)
              .delete('/v1/users/account')
              .set('Authorization', `Bearer ${deleteToken}`)
              .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('success', true)
                expect(res.body.message).to.contain('deactivated')
                done()
              })
          })
      })
    })
  })

  describe('👨‍💼 Admin User Management Endpoints', () => {
    
    describe('GET /v1/users', () => {
      it('✅ should get all users for admin', (done) => {
        chai.request(app)
          .get('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data).to.have.property('users')
            expect(res.body.data).to.have.property('pagination')
            expect(res.body.data.users).to.be.an('array')
            done()
          })
      })

      it('✅ should support pagination', (done) => {
        chai.request(app)
          .get('/v1/users?page=1&limit=5')
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body.data.pagination).to.have.property('currentPage', 1)
            expect(res.body.data.pagination).to.have.property('totalPages')
            done()
          })
      })
    })

    describe('POST /v1/users', () => {
      it('✅ should create new user as admin', (done) => {
        chai.request(app)
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: 'created@example.com',
            password: 'password123',
            firstName: 'Created',
            lastName: 'User',
            role: 'user'
          })
          .end((err, res) => {
            expect(res).to.have.status(201)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.email).to.equal('created@example.com')
            createdUserId = res.body.data.user.id // Store for later tests
            done()
          })
      })

      it('❌ should not create user with duplicate email', (done) => {
        chai.request(app)
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: 'created@example.com', // Same email as above
            password: 'password123',
            firstName: 'Duplicate',
            lastName: 'User'
          })
          .end((err, res) => {
            expect(res).to.have.status(409)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('GET /v1/users/:id', () => {
      it('✅ should get user by id as admin', (done) => {
        chai.request(app)
          .get(`/v1/users/${createdUserId}`) // Use the created user ID
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.id).to.equal(createdUserId)
            done()
          })
      })

      it('❌ should not get non-existent user', (done) => {
        chai.request(app)
          .get('/v1/users/00000000-0000-0000-0000-000000000000')
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(404)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('PUT /v1/users/:id', () => {
      it('✅ should update user as admin', (done) => {
        chai.request(app)
          .put(`/v1/users/${createdUserId}`) // Use the created user ID
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: 'AdminUpdated',
            role: 'admin'
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.firstName).to.equal('AdminUpdated')
            done()
          })
      })
    })

    describe('DELETE /v1/users/:id', () => {
      it('❌ should not allow admin to delete themselves', (done) => {
        chai.request(app)
          .delete(`/v1/users/${adminUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            expect(res.body.message).to.contain('Cannot delete your own account')
            done()
          })
      })

      it('✅ should delete user as admin', (done) => {
        chai.request(app)
          .delete(`/v1/users/${createdUserId}`) // Use the created user ID
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.message).to.contain('deleted successfully')
            done()
          })
      })
    })
  })

  describe('🏥 Health & Utility Endpoints', () => {
    
    describe('GET /health', () => {
      it('✅ should return health status', (done) => {
        chai.request(app)
          .get('/health')
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('status', 'OK')
            expect(res.body).to.have.property('timestamp')
            expect(res.body).to.have.property('environment')
            expect(res.body).to.have.property('apiVersion')
            done()
          })
      })
    })

    describe('GET /version', () => {
      it('✅ should return version information', (done) => {
        chai.request(app)
          .get('/version')
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('currentVersion')
            expect(res.body).to.have.property('supportedVersions')
            expect(res.body).to.have.property('timestamp')
            done()
          })
      })
    })
  })

  describe('🔒 Authorization Tests', () => {
    let regularUserToken

    before(function(done) {
      this.timeout(5000) // Increase timeout for email sending
      // Create and login as regular user
      chai.request(app)
        .post('/v1/auth/register')
        .send({
          email: 'regular@example.com',
          password: 'password123',
          firstName: 'Regular',
          lastName: 'User'
        })
        .end((err, res) => {
          regularUserToken = res.body.data.token
          done()
        })
    })

    it('❌ should not allow regular user to access admin endpoints', (done) => {
      chai.request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .end((err, res) => {
          expect(res).to.have.status(403)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('❌ should not allow regular user to create users', (done) => {
      chai.request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({
          email: 'unauthorized@example.com',
          password: 'password123',
          firstName: 'Unauthorized',
          lastName: 'User'
        })
        .end((err, res) => {
          expect(res).to.have.status(403)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('⚡ Performance & Edge Cases', () => {
    
    it('✅ should handle invalid JSON gracefully', (done) => {
      chai.request(app)
        .post('/v1/auth/login')
        .type('json')
        .send('{"invalid": json}')
        .end((err, res) => {
          expect(res).to.have.status(400)
          done()
        })
    })

    it('✅ should handle missing Content-Type header', (done) => {
      chai.request(app)
        .post('/v1/auth/login')
        .send(`email=${testUser.email}&password=${testUser.password}`)
        .end((err, res) => {
          // The form-encoded data is actually being parsed successfully by express
          // and the credentials are valid, so we get 200 
          expect(res).to.have.status(200)
          done()
        })
    })

    it('✅ should include correct headers in response', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.header('X-API-Version')
          expect(res).to.have.header('X-API-Supported-Versions')
          done()
        })
    })
  })
}) 