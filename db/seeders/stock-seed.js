"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Stocks",
      [
        {
          startingStock: 320,
          total: 320,
          sizeId: 1,
          patternId: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 40,
          total: 40,
          sizeId: 1,
          patternId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 4,
          total: 4,
          sizeId: 1,
          patternId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 12,
          total: 12,
          sizeId: 1,
          patternId: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 14,
          total: 14,
          sizeId: 1,
          patternId: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 18,
          total: 18,
          sizeId: 1,
          patternId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 2,
          total: 2,
          sizeId: 7,
          patternId: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 34,
          total: 34,
          sizeId: 2,
          patternId: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 30,
          total: 30,
          sizeId: 3,
          patternId: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          startingStock: 26,
          total: 26,
          sizeId: 3,
          patternId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Stocks", null, {});
  },
};
