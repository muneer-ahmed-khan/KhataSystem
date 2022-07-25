const path = require("path");

// import environment variables
require("dotenv").config();

// setting up express server
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// views settings for express app - ejs -views
app.set("view engine", "ejs");
app.set("views", "views");

// new routes import
const bankRoutes = require("./routes/bank");
const sizeRoutes = require("./routes/size");
const patternRoutes = require("./routes/pattern");
const stockRoutes = require("./routes/stock");
const amountTypesRoutes = require("./routes/amount-type");
const bankAccountRoutes = require("./routes/bank-account");
const customerRoutes = require("./routes/customer");
const roznamchaRoutes = require("./routes/roznamcha");

// new models import
const Bank = require("./models/bank");
const BankAccount = require("./models/bank-account");
const Size = require("./models/size");
const Pattern = require("./models/pattern");
const Customer = require("./models/customer");
const Roznamcha = require("./models/roznamcha");
const AmountType = require("./models/amount-type");
const Stock = require("./models/stock");

// database object
const sequelize = require("./util/database");

// new controllers
const errorController = require("./controllers/error");

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

// new routes
app.use(bankRoutes);
app.use(sizeRoutes);
app.use(patternRoutes);
app.use(stockRoutes);
app.use(amountTypesRoutes);
app.use(bankAccountRoutes);
app.use(customerRoutes);
app.use(roznamchaRoutes);
// app.use(whatsapp);

app.use(errorController.get404);

// create database relationships
// Bank --> BankAccount
BankAccount.belongsTo(Bank);
Bank.hasMany(BankAccount);

// Roznamcha --> EntryTypes --> Customer --> BankAccount --> Size --> Pattern
// Roznamcha.belongsTo(EntryType);
// EntryType.hasMany(Roznamcha);
Roznamcha.belongsTo(Customer);
Customer.hasMany(Roznamcha);
Roznamcha.belongsTo(BankAccount);
BankAccount.hasMany(Roznamcha);
Roznamcha.belongsTo(Size);
Size.hasMany(Roznamcha);
Roznamcha.belongsTo(Pattern);
Pattern.hasMany(Roznamcha);

// Stock --> Size
Stock.belongsTo(Size);
Size.hasMany(Stock);

// Stock --> Pattern
Stock.belongsTo(Pattern);
Pattern.hasMany(Stock);

// Customer --> AmountType
Customer.belongsTo(AmountType);
AmountType.hasMany(Customer);

// import whatsapp file settings
// require("./services/whatsapp");

// authenticate the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Authentication has been done completely  successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// connect to database now
sequelize
  .sync({
    // force: true,
  }) // use for first time while creating schema in database
  // .sync()
  .then(() => {
    console.log("Database Connected now");
    console.log("listening on port ", process.env.PORT);
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
  });

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
