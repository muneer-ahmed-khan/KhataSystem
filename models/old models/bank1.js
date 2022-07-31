const Sequelize = require("sequelize"); // main Sequelize Object

const sequelize = require("../../util/database"); // database instance

const Bank = sequelize.define("bank", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
});

module.exports = Bank;
