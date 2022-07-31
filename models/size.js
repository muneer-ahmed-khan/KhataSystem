"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Size = sequelize.define("Size", {
    type: DataTypes.STRING,
  });

  // associations can be defined here
  Size.associate = function (models) {
    Size.hasMany(models.Stock, { as: "size", foreignKey: "id" });
  };

  return Size;
};
