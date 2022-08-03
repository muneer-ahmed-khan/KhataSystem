"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn(
        "CashBooks", // name of Source model
        "bankAccountId", // name of the key we're adding
        {
          type: Sequelize.INTEGER,
          references: {
            model: "BankAccounts", // name of Target model
            key: "id", // key in Target model that we're referencing
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        }
      ),

      queryInterface.addColumn(
        "CashBooks", // name of Source model
        "customerId", // name of the key we're adding
        {
          type: Sequelize.INTEGER,
          references: {
            model: "Customers", // name of Target model
            key: "id", // key in Target model that we're referencing
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        }
      ),
    ];
  },

  async down(queryInterface, Sequelize) {
    return [
      queryInterface.removeColumn(
        "CashBooks", // name of Source model
        "bankAccountId" // key we want to remove
      ),
      queryInterface.removeColumn(
        "CashBooks", // name of Source model
        "customerId" // key we want to remove
      ),
    ];
  },
};
