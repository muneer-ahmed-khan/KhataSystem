const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const BankAccount = sequelize.define("bankAccount", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  accountName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: Sequelize.BIGINT,
    allowNull: false,
  },
  balance: {
    type: Sequelize.DECIMAL,
    allowNull: false,
  },
});

module.exports = BankAccount;
