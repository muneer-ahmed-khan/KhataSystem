"use strict";

module.exports = (sequelize, DataTypes) => {
  const Pattern = sequelize.define("Pattern", {
    name: DataTypes.STRING,
  });

  // associations can be defined here
  Pattern.associate = function (models) {
    // Pattern --> Stock
    Pattern.hasMany(models.Stock, { as: "stock", foreignKey: "patternId" });
    // Pattern --> StockBook
    Pattern.hasMany(models.StockBook, {
      as: "stockBook",
      foreignKey: "patternId",
    });
  };

  return Pattern;
};
