const Sequelize = require("sequelize"); // main Sequelize Object

const sequelize = require("../../util/database"); // database instance

const Stock = sequelize.define("stock", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  startingStock: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  total: Sequelize.INTEGER,
});

module.exports = Stock;
