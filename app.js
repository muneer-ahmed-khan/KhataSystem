// third party imports
const path = require("path");
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
const { generateStockKhata } = require("./meta/stock-whatsapp-queries");
async function test() {
  console.log(await generateStockKhata(11));
}
// test();

// const dialogflowTestRoutes = require("./routes/dialogflowTest");

// general error controller
const errorController = require("./controllers/error");

// setting up express server
const app = express();

// views settings for express app - ejs - views
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());
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
// app.use(dialogflowTestRoutes);
// enable or disable whatsapp here
require("./services/whatsapp");

app.use(errorController.get404);

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
