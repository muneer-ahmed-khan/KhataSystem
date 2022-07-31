"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Sizes",
      [
        {
          type: "1200R20",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "1100R20",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "1000R20",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "900R20",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "825R16",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "750R16",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Sizes", null, {});
  },
};
