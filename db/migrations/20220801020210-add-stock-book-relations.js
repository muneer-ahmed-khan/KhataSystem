"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return [
      queryInterface.addColumn(
        "StockBooks", // name of Source model
        "sizeId", // name of the key we're adding
        {
          type: Sequelize.INTEGER,
          references: {
            model: "Sizes", // name of Target model
            key: "id", // key in Target model that we're referencing
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        }
      ),
      queryInterface.addColumn(
        "StockBooks", // name of Source model
        "patternId", // name of the key we're adding
        {
          type: Sequelize.INTEGER,
          references: {
            model: "Patterns", // name of Target model
            key: "id", // key in Target model that we're referencing
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        }
      ),
      queryInterface.addColumn(
        "StockBooks", // name of Source model
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
        "StockBooks", // name of Source model
        "sizeId" // key we want to remove
      ),
      queryInterface.removeColumn(
        "StockBooks", // name of Source model
        "patternId" // key we want to remove
      ),
      queryInterface.removeColumn(
        "StockBooks", // name of Source model
        "customerId" // key we want to remove
      ),
    ];
  },
};
