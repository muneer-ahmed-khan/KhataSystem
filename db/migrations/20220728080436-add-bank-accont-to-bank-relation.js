"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "BankAccounts", // name of Source model
      "bankId", // name of the key we're adding
      {
        type: Sequelize.INTEGER,
        references: {
          model: "Banks", // name of Target model
          key: "id", // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      "BankAccounts", // name of Source model
      "bankId" // key we want to remove
    );
  },
};
