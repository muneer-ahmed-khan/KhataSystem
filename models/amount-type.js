const Sequelize = require("sequelize");
const { CONSTANTS } = require("../config/constants");

const sequelize = require("../util/database");

const AmountType = sequelize.define("amountType", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  type: {
    type: Sequelize.ENUM([
      CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.CREDIT,
      CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.DEBIT,
      CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
    ]),
    allowNull: true,
  },
});

module.exports = AmountType;
