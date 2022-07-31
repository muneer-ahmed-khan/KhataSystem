const Sequelize = require("sequelize");

const sequelize = require("../../util/database");
const { CONSTANTS } = require("../../config/constants");

const Roznamcha = sequelize.define("Roznamcha", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  entryType: {
    type: Sequelize.ENUM([
      CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK,
      CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK,
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
  truckNumber: Sequelize.STRING,
  qty: Sequelize.INTEGER,
  amount: {
    type: Sequelize.DECIMAL,
    allowNull: false,
  },
  location: Sequelize.STRING,
});

module.exports = Roznamcha;
