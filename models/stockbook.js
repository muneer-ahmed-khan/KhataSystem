"use strict";
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
    sizeId: DataTypes.INTEGER,
    patternId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER,
  });

  // associations can be defined here
  StockBook.associate = function (models) {
    // StockBook --> Size Relation
    StockBook.belongsTo(models.Size, {
      as: "size",
      foreignKey: "sizeId",
      onDelete: "CASCADE",
    });
    // StockBook --> Pattern Relation
    StockBook.belongsTo(models.Pattern, {
      as: "pattern",
      foreignKey: "patternId",
      onDelete: "CASCADE",
    });
    // StockBook --> Customer Relation
    StockBook.belongsTo(models.Customer, {
      as: "customer",
      foreignKey: "customerId",
      onDelete: "CASCADE",
    });
  };

  return StockBook;
};
