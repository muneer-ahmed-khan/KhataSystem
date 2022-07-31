"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Patterns",
      [
        {
          name: "HO104",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO105",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO105 +",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "HO121",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO301",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO302",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO303",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO304",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO305",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO307",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO311",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO313",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "HO321",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Patterns", null, {});
  },
};
