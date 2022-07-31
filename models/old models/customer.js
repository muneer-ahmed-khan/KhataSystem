const Sequelize = require("sequelize");

const sequelize = require("../../util/database");

const Customer = sequelize.define("customer", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
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
  startingBalance: {
    type: Sequelize.DECIMAL,
    allowNull: false,
  },
  balance: {
    type: Sequelize.DECIMAL,
    allowNull: false,
  },
});

module.exports = Customer;
