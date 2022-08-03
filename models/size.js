"use strict";

module.exports = (sequelize, DataTypes) => {
  const Size = sequelize.define("Size", {
    type: DataTypes.STRING,
  });

  // associations can be defined here
  Size.associate = function (models) {
    // Size --> Stock
    Size.hasMany(models.Stock, { as: "stock", foreignKey: "sizeId" });
    // Size --> StockBook
    Size.hasMany(models.StockBook, { as: "stockBook", foreignKey: "sizeId" });
  };

  return Size;
};
