'use strict';

const uuid = require('uuid');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          uuid: uuid.v4(),
          name: 'user',
          balance: 1000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
