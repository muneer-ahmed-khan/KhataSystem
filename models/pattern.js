const Sequelize = require("sequelize"); // main Sequelize Object

const sequelize = require("../util/database"); // database instance

const Pattern = sequelize.define("pattern", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
});

module.exports = Pattern;
