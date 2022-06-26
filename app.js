const path = require("path");
// import environment variables
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

// new controllers
const errorController = require("./controllers/error");

// new models
const Bank = require("./models/bank");
const BankAccount = require("./models/bank-account");
const Size = require("./models/size");
const Pattern = require("./models/pattern");
const Customer = require("./models/customer");
const Entry = require("./models/entry");
const EntryType = require("./models/entry-type");

// old models
// const Product = require("./models/product");
// const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

const app = express();

// database object
const sequelize = require("./util/database");

app.set("view engine", "ejs");
app.set("views", "views");

// new routes import
const bankRoutes = require("./routes/bank");
const sizeRoutes = require("./routes/size");
const patternRoutes = require("./routes/pattern");
const entryTypesRoutes = require("./routes/entry-types");
const bankAccountRoutes = require("./routes/bank-account");

// const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');

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
app.use(entryTypesRoutes);
app.use(bankAccountRoutes);

// app.use('/admin', adminRoutes);
// app.use(shopRoutes);

app.use(errorController.get404);

// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });

// create table relations

// Bank --> BankAccount
BankAccount.belongsTo(Bank);
Bank.hasMany(BankAccount);

// Entry --> EntryTypes --> Customer --> BankAccount
Entry.belongsTo(EntryType);
EntryType.hasMany(Entry);
Entry.belongsToMany(Customer, { through: "customerEntry" });
Customer.belongsToMany(Entry, { through: "customerEntry" });
Entry.belongsToMany(BankAccount, { through: "bankAccountEntry" });
BankAccount.belongsToMany(Entry, { through: "bankAccountEntry" });

// Size --> Pattern
Size.belongsToMany(Pattern, { through: "sizePattern" });
Pattern.belongsToMany(Size, { through: "sizePattern" });

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
  // .sync({
  // force: true,
  // }) // use for first time while creating schema in database
  .sync()
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
