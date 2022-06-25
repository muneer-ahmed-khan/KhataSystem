const Sequelize = require("sequelize");

let sequelize;

// database settings for local environment
if (process.env.NODE_ENV === "local") {
  sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USERNAME,
    process.env.PASSWORD,
    {
      dialect: "postgres",
      host: process.env.HOST,
      logging: (msg) => console.log("\n-----Database --> Log: \n", msg, "\n"),
    }
  );
  // database settings for production environment
} else {
  sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USERNAME,
    process.env.PASSWORD,
    {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      host: process.env.HOST,
      logging: (msg) => console.log("\n-----Database --> Log: \n", msg, "\n"),
    }
  );
}

module.exports = sequelize;
