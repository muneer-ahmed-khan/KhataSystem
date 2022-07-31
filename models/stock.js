"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define("Stock", {
    startingStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: DataTypes.INTEGER,
    sizeId: { type: DataTypes.INTEGER, foreignKey: "sizeId" },
    patternId: { type: DataTypes.INTEGER, foreignKey: "patternId" },
  });

  // associations can be defined here
  Stock.associate = function (models) {
    Stock.belongsTo(models.Size, {
      as: "size",
      foreignKey: "sizeId",
      onDelete: "CASCADE",
    });
    Stock.belongsTo(models.Pattern, {
      as: "pattern",
      foreignKey: "patternId",
      onDelete: "CASCADE",
    });
  };

  return Stock;
};
