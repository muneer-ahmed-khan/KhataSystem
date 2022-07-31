"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Banks",
      [
        {
          name: "Alfalah Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Alied Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bank Al Habib",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Faisal Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Habib Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Islami Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "JS Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "MCB Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Meezan Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Soneri Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "United Bank",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Banks", null, {});
  },
};
