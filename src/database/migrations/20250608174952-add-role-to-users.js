'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('USER', 'role', {
      type: Sequelize.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
      after: 'lastName'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('USER', 'role');
    // Also drop the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_USER_role";');
  }
};
