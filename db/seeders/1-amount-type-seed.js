"use strict";
const { CONSTANTS } = require("../../config/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "AmountTypes",
      [
        {
          type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.CREDIT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.DEBIT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AmountTypes", null, {});
  },
};
