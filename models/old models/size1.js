const Sequelize = require("sequelize"); // main Sequelize Object

const sequelize = require("../../util/database"); // database instance

const Size = sequelize.define("size", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: Sequelize.STRING,
});

module.exports = Size;
