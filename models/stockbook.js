"use strict";
const { Model } = require("sequelize");
const { CONSTANTS } = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const StockBook = sequelize.define("StockBook", {
    entryType: {
      type: DataTypes.ENUM([
        CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK,
        CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK,
      ]),
      allowNull: true,
    },
    customerType: {
      type: DataTypes.ENUM([
        CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH,
        CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH,
      ]),
      allowNull: true,
    },
    cashCustomer: DataTypes.STRING,
    truckNumber: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  });

  // associations can be defined here
  StockBook.associate = function (models) {};

  return StockBook;
};
