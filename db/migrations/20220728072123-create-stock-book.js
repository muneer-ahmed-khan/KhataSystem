"use strict";
const { CONSTANTS } = require("../../config/constants");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StockBook", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      entryType: {
        type: Sequelize.ENUM([
          CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK,
          CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK,
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
      cashCustomer: Sequelize.STRING,
      truckNumber: Sequelize.STRING,
      qty: Sequelize.INTEGER,
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
    await queryInterface.dropTable("StockBook");
  },
};
