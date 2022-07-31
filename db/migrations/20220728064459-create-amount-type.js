"use strict";
const { CONSTANTS } = require("../../config/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AmountTypes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.ENUM([
          CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.CREDIT,
          CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.DEBIT,
          CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
        ]),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AmountTypes");
  },
};
