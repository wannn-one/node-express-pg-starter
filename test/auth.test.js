const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app')
const db = require('../src/database/models').default

const { expect } = chai
chai.use(chaiHttp)

const { User, BlacklistedToken } = db

describe('🔐 Authentication Controller Tests', () => {
  let userToken
  let testUserId

  const testUser = {
    email: 'authtest@example.com',
    password: 'password123',
    firstName: 'Auth',
    lastName: 'Test'
  }

  const newUser = {
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'New',
    lastName: 'User'
  }

  // Setup
  before(async () => {
    // Clean up auth test data with better pattern
    await User.destroy({ 
      where: { 
        email: { 
          [db.Sequelize.Op.or]: [
            { [db.Sequelize.Op.like]: '%test%' },
            { [db.Sequelize.Op.like]: '%example.com' }
          ]
        } 
      }, 
      force: true 
    })
    await BlacklistedToken.destroy({ where: {}, force: true })

    // Create test user
    const user = await User.create({
      ...testUser,
      isEmailVerified: true
    })
    testUserId = user.id
  })

  // Cleanup
  after(async () => {
    await User.destroy({ 
      where: { 
        email: { 
          [db.Sequelize.Op.or]: [
            { [db.Sequelize.Op.like]: '%test%' },
            { [db.Sequelize.Op.like]: '%example.com' }
          ]
        } 
      }, 
      force: true 
    })
    await BlacklistedToken.destroy({ where: {}, force: true })
  })

  describe('POST /v1/auth/register', () => {
    it('✅ should register a new user successfully', function(done) {
      this.timeout(8000) // Increased timeout for email
      chai.request(app)
        .post('/v1/auth/register')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(201)
          expect(res.body).to.have.property('success', true)
          expect(res.body).to.have.property('data')
          expect(res.body.data).to.have.property('user')
          expect(res.body.data).to.have.property('token')
          expect(res.body.data.user.email).to.equal(newUser.email)
          expect(res.body.data.user).to.not.have.property('password')
          done()
        })
    })

    it('❌ should not register user with invalid email', (done) => {
      chai.request(app)
        .post('/v1/auth/register')
        .send({
          ...newUser,
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
          ...newUser,
          email: 'shortpass@example.com',
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

    it('❌ should not register user with missing fields', (done) => {
      chai.request(app)
        .post('/v1/auth/register')
        .send({
          email: 'incomplete@example.com',
          password: 'password123'
          // Missing firstName and lastName
        })
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
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
          expect(res.body.data.user).to.not.have.property('password')
          userToken = res.body.data.token
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

    it('❌ should not login with missing credentials', (done) => {
      chai.request(app)
        .post('/v1/auth/login')
        .send({
          email: testUser.email
          // Missing password
        })
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('POST /v1/auth/logout', () => {
    let logoutToken

    before((done) => {
      // Get fresh token for logout test
      chai.request(app)
        .post('/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .end((err, res) => {
          logoutToken = res.body.data.token
          done()
        })
    })

    it('✅ should logout successfully with valid token', (done) => {
      chai.request(app)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${logoutToken}`)
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
        .set('Authorization', `Bearer ${logoutToken}`)
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('success', false)
          expect(res.body.message).to.contain('invalidated')
          done()
        })
    })

    it('❌ should not logout with invalid token', (done) => {
      chai.request(app)
        .post('/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('POST /v1/auth/change-password', () => {
    it('✅ should change password successfully', function(done) {
      this.timeout(3000)
      // Get fresh token for this test
      chai.request(app)
        .post('/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .end((err, res) => {
          if (err || !res.body.data) {
            console.error('Login failed:', res.body)
            return done(new Error('Failed to get token for change password test'))
          }
          
          const changePasswordToken = res.body.data.token
          
          // Use setImmediate to avoid timing issues
          setImmediate(() => {
            chai.request(app)
              .post('/v1/auth/change-password')
              .set('Authorization', `Bearer ${changePasswordToken}`)
              .send({
                currentPassword: testUser.password,
                newPassword: 'newpassword123'
              })
              .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('success', true)
                // Update test password for future tests
                testUser.password = 'newpassword123'
                done()
              })
          })
        })
    })

    it('❌ should not change password with wrong current password', function(done) {
      this.timeout(3000)
      // Get fresh token with updated password
      chai.request(app)
        .post('/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .end((err, res) => {
          if (err || !res.body.data) {
            return done(new Error('Failed to get token'))
          }
          
          const freshToken = res.body.data.token
          
          chai.request(app)
            .post('/v1/auth/change-password')
            .set('Authorization', `Bearer ${freshToken}`)
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

    it('❌ should not change password without token', (done) => {
      chai.request(app)
        .post('/v1/auth/change-password')
        .send({
          currentPassword: testUser.password,
          newPassword: 'newpassword123'
        })
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('❌ should not change password with short new password', function(done) {
      this.timeout(3000)
      // Get fresh token with updated password
      chai.request(app)
        .post('/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .end((err, res) => {
          if (err || !res.body.data) {
            return done(new Error('Failed to get token'))
          }
          
          const freshToken = res.body.data.token
          chai.request(app)
            .post('/v1/auth/change-password')
            .set('Authorization', `Bearer ${freshToken}`)
            .send({
              currentPassword: testUser.password,
              newPassword: '123'
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
      this.timeout(8000) // Increased timeout for email
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

    it('❌ should not process request with invalid email format', (done) => {
      chai.request(app)
        .post('/v1/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('❌ should not process request without email', (done) => {
      chai.request(app)
        .post('/v1/auth/forgot-password')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('POST /v1/auth/verify-email', () => {
    it('❌ should not verify with invalid token', (done) => {
      chai.request(app)
        .post('/v1/auth/verify-email')
        .send({
          token: 'invalid-token'
        })
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })

    it('❌ should not verify without token', (done) => {
      chai.request(app)
        .post('/v1/auth/verify-email')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })

  describe('POST /v1/auth/resend-verification', () => {
    it('❌ should not resend verification without token', (done) => {
      chai.request(app)
        .post('/v1/auth/resend-verification')
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.have.property('success', false)
          done()
        })
    })
  })
}) 