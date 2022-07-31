"use strict";
const { Model } = require("sequelize");
const { CONSTANTS } = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const CashBook = sequelize.define("CashBook", {
    entryType: {
      type: DataTypes.ENUM([
        CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT,
        CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT,
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
    paymentType: {
      type: DataTypes.ENUM([
        CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH,
        CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CHECK,
        CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.TRANSFER,
      ]),
      allowNull: true,
    },
    cashCustomer: DataTypes.STRING,
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  });

  // associations can be defined here
  CashBook.associate = function (models) {};

  return CashBook;
};
