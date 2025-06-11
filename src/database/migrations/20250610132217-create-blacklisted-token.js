'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BLACKLISTED_TOKEN', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'USER',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'logout'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    // Add indexes for better performance
    await queryInterface.addIndex('BLACKLISTED_TOKEN', ['token'])
    await queryInterface.addIndex('BLACKLISTED_TOKEN', ['userId'])
    await queryInterface.addIndex('BLACKLISTED_TOKEN', ['expiresAt'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BLACKLISTED_TOKEN')
  }
};
