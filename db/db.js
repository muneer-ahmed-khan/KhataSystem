const fs = require("fs");

module.exports = {
  local: {
    // username: process.env.USERNAME,
    // password: process.env.PASSWORD,
    // database: process.env.DATABASE,
    // host: process.env.HOST,
    username: "muneerkhan",
    password: "Admin555",
    database: "khata_local",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  },
  production: {
    database_url: process.env.DATABASE_URL,
    dialect: "postgres",
  },
};
