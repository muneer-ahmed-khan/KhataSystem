const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Roznamcha = sequelize.define("Roznamcha", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: {
    type: Sequelize.DECIMAL,
    allowNull: false,
  },
});

module.exports = Roznamcha;
