"use strict";
const { Model } = require("sequelize");
const { CONSTANTS } = require("../config/constants");

module.exports = (sequelize, DataTypes) => {
  const AmountType = sequelize.define("AmountType", {
    type: {
      type: DataTypes.ENUM([
        CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.CREDIT,
        CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.DEBIT,
        CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
      ]),
      allowNull: true,
    },
  });

  // associations can be defined here
  AmountType.associate = function (models) {
    AmountType.hasMany(models.Customer, {
      as: "amountType",
      foreignKey: "id",
    });
  };

  return AmountType;
};
