"use strict";

module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define("Bank", {
    name: DataTypes.STRING,
  });

  // associations can be defined here
  Bank.associate = function (models) {
    Bank.hasMany(models.BankAccount, {
      as: "bankAccount",
      foreignKey: "bankId",
    });
  };

  return Bank;
};
