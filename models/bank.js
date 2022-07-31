"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define("Bank", {
    name: DataTypes.STRING,
  });

  // associations can be defined here
  Bank.associate = function (models) {
    Bank.hasMany(models.BankAccount, {
      as: "bank",
      foreignKey: "id",
    });
  };

  return Bank;
};
