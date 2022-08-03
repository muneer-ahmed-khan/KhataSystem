"use strict";

const { CONSTANTS } = require("../../config/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CashBooks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      entryType: {
        type: Sequelize.ENUM([
          CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT,
          CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT,
        ]),
        allowNull: true,
      },
      customerType: {
        type: Sequelize.ENUM([
          CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH,
          CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH,
        ]),
        allowNull: true,
      },
      paymentType: {
        type: Sequelize.ENUM([
          CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH,
          CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CHECK,
          CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.TRANSFER,
        ]),
        allowNull: true,
      },
      cashCustomer: Sequelize.STRING,
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
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
    await queryInterface.dropTable("CashBooks");
  },
};
