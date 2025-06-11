'use strict'

const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    await queryInterface.bulkInsert('USER', [{
      id: uuidv4(),
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLoginAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id: uuidv4(),
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      passwordResetToken: null,
      passwordResetExpires: null,
      lastLoginAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('USER', {
      email: {
        [Sequelize.Op.in]: ['admin@example.com', 'user@example.com']
      }
    }, {})
  }
} 