"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const BankAccount = sequelize.define("BankAccount", {
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    startingBalance: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    bankId: {
      type: DataTypes.INTEGER,
      foreignKey: "bankId",
    },
  });

  // associations can be defined here
  BankAccount.associate = function (models) {
    BankAccount.belongsTo(models.Bank, {
      as: "bank",
      foreignKey: "bankId",
      onDelete: "CASCADE",
    });
  };

  return BankAccount;
};
