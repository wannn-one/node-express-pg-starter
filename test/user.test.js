const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../src/app')
const db = require('../src/database/models').default

const { expect } = chai
chai.use(chaiHttp)

const { User, BlacklistedToken } = db

describe('👤 User Controller Tests', () => {
  let userToken
  let adminToken
  let testUserId
  let adminUserId
  let createdUserId

  const testUser = {
    email: 'usertest@example.com',
    password: 'password123',
    firstName: 'User',
    lastName: 'Test'
  }

  const adminUser = {
    email: 'admintest@example.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'Test',
    role: 'admin'
  }

  // Setup
  before(async () => {
    // Clean up user test data
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%test%' } }, force: true })
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%created%' } }, force: true })
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%admin%' } }, force: true })
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%delete%' } }, force: true })
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

    // Login to get tokens
    const userLogin = await chai.request(app)
      .post('/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
    userToken = userLogin.body.data.token

    const adminLogin = await chai.request(app)
      .post('/v1/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      })
    adminToken = adminLogin.body.data.token
  })

  // Cleanup
  after(async () => {
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%test%' } }, force: true })
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%created%' } }, force: true })
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%admin%' } }, force: true })
    await User.destroy({ where: { email: { [db.Sequelize.Op.like]: '%delete%' } }, force: true })
    await BlacklistedToken.destroy({ where: {}, force: true })
  })

  describe('👤 User Profile Management', () => {
    
    describe('GET /v1/users/profile', () => {
      it('✅ should get user profile successfully', (done) => {
        chai.request(app)
          .get('/v1/users/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data).to.have.property('user')
            expect(res.body.data.user.email).to.equal(testUser.email)
            expect(res.body.data.user).to.not.have.property('password')
            expect(res.body.data.user).to.have.property('firstName')
            expect(res.body.data.user).to.have.property('lastName')
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

      it('❌ should not get profile with invalid token', (done) => {
        chai.request(app)
          .get('/v1/users/profile')
          .set('Authorization', 'Bearer invalid-token')
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
          .set('Authorization', `Bearer ${userToken}`)
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

      it('✅ should update only firstName', (done) => {
        chai.request(app)
          .put('/v1/users/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            firstName: 'OnlyFirst'
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.firstName).to.equal('OnlyFirst')
            done()
          })
      })

      it('❌ should not update profile with invalid data', (done) => {
        chai.request(app)
          .put('/v1/users/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            firstName: 'A' // Too short
          })
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not update profile without token', (done) => {
        chai.request(app)
          .put('/v1/users/profile')
          .send({
            firstName: 'Updated',
            lastName: 'Name'
          })
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not update profile with empty data', (done) => {
        chai.request(app)
          .put('/v1/users/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .send({})
          .end((err, res) => {
            expect(res).to.have.status(200) // Should still succeed but no changes
            expect(res.body).to.have.property('success', true)
            done()
          })
      })
    })

    describe('DELETE /v1/users/account', () => {
      it('✅ should deactivate account successfully', async () => {
        // Create user specifically for deletion test
        const deleteUser = await User.create({
          email: `deletetest-${Date.now()}@example.com`,
          password: 'password123',
          firstName: 'Delete',
          lastName: 'Test',
          isEmailVerified: true
        })

        const loginRes = await chai.request(app)
          .post('/v1/auth/login')
          .send({
            email: deleteUser.email,
            password: 'password123'
          })
        const deleteUserToken = loginRes.body.data.token

        // Test account deactivation
        const res = await chai.request(app)
          .delete('/v1/users/account')
          .set('Authorization', `Bearer ${deleteUserToken}`)

        expect(res).to.have.status(200)
        expect(res.body).to.have.property('success', true)
        expect(res.body.message).to.contain('deactivated')

        // Verify user cannot authenticate after deactivation
        const verifyRes = await chai.request(app)
          .get('/v1/users/profile')
          .set('Authorization', `Bearer ${deleteUserToken}`)

        expect(verifyRes).to.have.status(401) // Should be unauthorized after deactivation
      })

      it('❌ should not deactivate account without token', (done) => {
        chai.request(app)
          .delete('/v1/users/account')
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })
  })

  describe('👨‍💼 Admin User Management', () => {
    
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
            expect(res.body.data.pagination).to.have.property('totalUsers')
            done()
          })
      })

      it('✅ should support custom page size', (done) => {
        chai.request(app)
          .get('/v1/users?page=1&limit=2')
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body.data.users.length).to.be.at.most(2)
            done()
          })
      })

      it('❌ should not allow regular user to access', (done) => {
        chai.request(app)
          .get('/v1/users')
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(403)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not allow access without token', (done) => {
        chai.request(app)
          .get('/v1/users')
          .end((err, res) => {
            expect(res).to.have.status(401)
            expect(res.body).to.have.property('success', false)
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
            email: `created-${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Created',
            lastName: 'User',
            role: 'user'
          })
          .end((err, res) => {
            expect(res).to.have.status(201)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.role).to.equal('user')
            expect(res.body.data.user).to.not.have.property('password')
            createdUserId = res.body.data.user.id
            done()
          })
      })

      it('✅ should create admin user as admin', (done) => {
        chai.request(app)
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: `newadmin-${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'New',
            lastName: 'Admin',
            role: 'admin'
          })
          .end((err, res) => {
            expect(res).to.have.status(201)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.role).to.equal('admin')
            done()
          })
      })

      it('❌ should not create user with duplicate email', (done) => {
        chai.request(app)
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: testUser.email, // Use existing test user email
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

      it('❌ should not allow regular user to create users', (done) => {
        chai.request(app)
          .post('/v1/users')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            email: `unauthorized-${Date.now()}@example.com`,
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

      it('❌ should not create user with invalid data', (done) => {
        chai.request(app)
          .post('/v1/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            email: 'invalid-email',
            password: '123', // Too short
            firstName: 'Invalid',
            lastName: 'User'
          })
          .end((err, res) => {
            expect(res).to.have.status(400)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('GET /v1/users/:id', () => {
      it('✅ should get user by id as admin', (done) => {
        chai.request(app)
          .get(`/v1/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.id).to.equal(testUserId)
            expect(res.body.data.user).to.not.have.property('password')
            done()
          })
      })

      it('✅ should allow user to access their own data', (done) => {
        chai.request(app)
          .get(`/v1/users/${testUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
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

      it('❌ should not allow user to access other users data', (done) => {
        chai.request(app)
          .get(`/v1/users/${adminUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(403)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })

    describe('PUT /v1/users/:id', () => {
      it('✅ should update user as admin', (done) => {
        // Only run this test if createdUserId is available
        if (!createdUserId) {
          return done()
        }
        
        chai.request(app)
          .put(`/v1/users/${createdUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: 'AdminUpdated',
            role: 'admin'
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.firstName).to.equal('AdminUpdated')
            expect(res.body.data.user.role).to.equal('admin')
            done()
          })
      })

      it('✅ should allow user to update their own data', (done) => {
        chai.request(app)
          .put(`/v1/users/${testUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            firstName: 'SelfUpdated'
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.data.user.firstName).to.equal('SelfUpdated')
            // Regular user should not be able to change role
            expect(res.body.data.user.role).to.equal('user')
            done()
          })
      })

      it('❌ should not allow regular user to change role', (done) => {
        chai.request(app)
          .put(`/v1/users/${testUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            role: 'admin' // Should be ignored
          })
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body.data.user.role).to.equal('user') // Should remain user
            done()
          })
      })

      it('❌ should not allow user to update other users', (done) => {
        chai.request(app)
          .put(`/v1/users/${adminUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            firstName: 'Unauthorized'
          })
          .end((err, res) => {
            expect(res).to.have.status(403)
            expect(res.body).to.have.property('success', false)
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
        // Only run this test if createdUserId is available
        if (!createdUserId) {
          return done()
        }

        chai.request(app)
          .delete(`/v1/users/${createdUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.have.property('success', true)
            expect(res.body.message).to.contain('deleted successfully')
            done()
          })
      })

      it('❌ should not allow regular user to delete users', (done) => {
        chai.request(app)
          .delete(`/v1/users/${adminUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(403)
            expect(res.body).to.have.property('success', false)
            done()
          })
      })

      it('❌ should not allow user to delete themselves via admin endpoint', (done) => {
        chai.request(app)
          .delete(`/v1/users/${testUserId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(403) // User cannot access admin endpoint
            expect(res.body).to.have.property('success', false)
            done()
          })
      })
    })
  })
}) 