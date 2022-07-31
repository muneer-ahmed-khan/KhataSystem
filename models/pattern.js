"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Pattern = sequelize.define("Pattern", {
    name: DataTypes.STRING,
  });

  // associations can be defined here
  Pattern.associate = function (models) {
    Pattern.belongsTo(models.Stock, { as: "pattern", foreignKey: "id" });
  };

  return Pattern;
};
