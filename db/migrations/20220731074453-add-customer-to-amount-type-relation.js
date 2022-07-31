"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "Customers", // name of Source model
      "amountTypeId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "AmountTypes", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      "Customers", // name of Source model
      "amountTypeId" // key we want to remove
    );
  },
};
