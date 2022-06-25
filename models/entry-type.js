const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const EntryType = sequelize.define("entryType", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = EntryType;
