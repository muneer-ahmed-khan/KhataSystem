// third party imports
const path = require("path");
const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");

// local imports
// import environment variables
require("dotenv").config();

// import all routers files
const bankRoutes = require("./routes/bank");
const sizeRoutes = require("./routes/size");
const patternRoutes = require("./routes/pattern");
const amountTypesRoutes = require("./routes/amount-type");
const bankAccountRoutes = require("./routes/bank-account");
const stockRoutes = require("./routes/stock");
const customerRoutes = require("./routes/customer");
const stockBookRoutes = require("./routes/stock-book");
const cashBookRoutes = require("./routes/cash-book");

// general error controller
const errorController = require("./controllers/error");

// new models import

// console.log("chjeck ", BankAccounts.findByPk(1));
// const Pattern = require("./models/old models/pattern1");
// const Customer = require("./models/old models/customer");
// const Roznamcha = require("./models/old models/roznamcha");
// const AmountType = require("./models/old models/amount-type1");
// const Stock = require("./models/old models/stock1");

// database object
// const sequelize = require("./util/database");
// const test = BankAccount(sequelize, Sequelize.DataTypes);
// console.log(test.associate());
// new controllers

// setting up express server
const app = express();

// views settings for express app - ejs - views
app.set("view engine", "ejs");
app.set("views", "views");

// request body parser and static folder settings
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use((req, res, next) => {
//   User.findById(1)
//     .then(user => {
//       req.user = user;
//       next();
//     })
//     .catch(err => console.log(err));
// });

// routes middleware to catch requests
app.use(bankRoutes);
app.use(sizeRoutes);
app.use(patternRoutes);
app.use(amountTypesRoutes);
app.use(bankAccountRoutes);
app.use(stockRoutes);
app.use(customerRoutes);
app.use(stockBookRoutes);
app.use(cashBookRoutes);
// app.use(whatsapp);

app.use(errorController.get404);

// create database relationships
// // Bank --> BankAccount
// BankAccount.belongsTo(Bank);
// Bank.hasMany(BankAccount);

// // Roznamcha --> EntryTypes --> Customer --> BankAccount --> Size --> Pattern
// // Roznamcha.belongsTo(EntryType);
// // EntryType.hasMany(Roznamcha);
// Roznamcha.belongsTo(Customer);
// Customer.hasMany(Roznamcha);
// Roznamcha.belongsTo(BankAccount);
// BankAccount.hasMany(Roznamcha);
// Roznamcha.belongsTo(Size);
// Size.hasMany(Roznamcha);
// Roznamcha.belongsTo(Pattern);
// Pattern.hasMany(Roznamcha);

// // Stock --> Size
// Stock.belongsTo(Size);
// Size.hasMany(Stock);

// // Stock --> Pattern
// Stock.belongsTo(Pattern);
// Pattern.hasMany(Stock);

// // Customer --> AmountType
// Customer.belongsTo(AmountType);
// AmountType.hasMany(Customer);

// import whatsapp file settings
// require("./services/whatsapp");

// authenticate the connection
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("Authentication has been done completely  successfully.");
//   })
//   .catch((error) => {
//     console.error("Unable to connect to the database:", error);
//   });

// connect to database now
// sequelize
// .sync({
// force: true,
// }) // use for first time while creating schema in database
// .sync()
// .then(() => {
//   console.log("Database Connected now");
//   console.log("listening on port ", process.env.PORT);
//   app.listen(process.env.PORT);
// })
// .catch((err) => {
//   console.log(err);
// });

console.log("Database Connected now");
console.log("listening on port ", process.env.PORT);
app.listen(process.env.PORT);

// sequelize
//   // .sync({ force: true })
//   .sync()
//   .then(result => {
//     return User.findById(1);
//     // console.log(result);
//   })
//   .then(user => {
//     if (!user) {
//       return User.create({ name: 'Max', email: 'test@test.com' });
//     }
//     return user;
//   })
//   .then(user => {
//     // console.log(user);
//     return user.createCart();
//   })
//   .then(cart => {
//     app.listen(3000);
//   })
//   .catch(err => {
//     console.log(err);
//   });
