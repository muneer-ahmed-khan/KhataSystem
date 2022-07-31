"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "Stocks", // name of Source model
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
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      "Stocks", // name of Source model
      "patternId" // key we want to remove
    );
  },
};
