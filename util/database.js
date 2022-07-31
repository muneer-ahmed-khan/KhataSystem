const Sequelize = require("sequelize");

let sequelize;

// database settings for local environment
if (process.env.NODE_ENV === "local") {
  console.log("loaded local environment");
  sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USERNAME,
    process.env.PASSWORD,
    {
      dialect: "postgres",
      host: process.env.HOST,
      // logging: (msg) => console.log("\n-----Database --> Log: \n", msg, "\n"),
      // logQueryParameters: true,
      logging: false,
    }
  );
  // database settings for production environment
} else {
  console.log("connected to the  production environment");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });
}

module.exports = sequelize;
