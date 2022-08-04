const {
  Customer,
  AmountType,
  BankAccount,
  Pattern,
  Size,
} = require("../models");
const { CONSTANTS } = require("../config/constants");

// get all customers
exports.getAllCustomers = async (req, res, next) => {
  try {
    // get all customers from db
    const customers = await Customer.findAll({
      include: [{ model: AmountType, as: "amountType" }],
      order: [["name", "ASC"]],
    });

    // render the all customer template
    res.render("customer/customer.ejs", {
      customers: customers,
      pageTitle: "All Customers",
      path: "/customer",
    });
  } catch (reason) {
    console.log(
      "Error: in getAllCustomers controller with reason --> ",
      reason
    );
  }
};

// render add customer screen
exports.addCustomer = async (req, res, next) => {
  try {
    // get amount types for customer
    const amountTypes = await AmountType.findAll({ order: [["id", "ASC"]] });

    // render add customer template
    res.render("customer/edit-customer", {
      pageTitle: "Add Customer",
      path: "/customer",
      editing: false,
      amountTypes: amountTypes,
    });
  } catch (reason) {
    console.log("Error: in addCustomer controller with reason --> ", reason);
  }
};

// add new customer to db
exports.postAddCustomer = async (req, res, next) => {
  // get new customer details from request params
  const name = req.body.name;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const startingBalance = req.body.startingBalance;
  const amountTypeId = req.body.amountType;

  try {
    // check if we get all information needed for new customer to create
    if (name && address && phoneNumber && startingBalance && amountTypeId)
      // create new customer with new details
      await Customer.create({
        name: name,
        address: address,
        phoneNumber: phoneNumber,
        startingBalance: startingBalance,
        balance: startingBalance,
        amountTypeId: amountTypeId,
      });

    // render the customer template with new details included
    console.log("Created Customer");
    res.redirect("/customer");
  } catch (reason) {
    console.log(
      "Error: in postAddCustomer controller with reason --> ",
      reason
    );
  }
};

// get existing customer info
exports.getEditCustomer = async (req, res, next) => {
  // get editMode value from request params
  const editMode = req.query.edit;

  // if editMode = false then do nothing
  if (!editMode) {
    return res.redirect("/customer");
  }

  // get customerId from request params
  const customerId = req.params.customerId;

  try {
    // get amount types from db
    const amountTypes = await AmountType.findAll({ order: [["id", "ASC"]] });

    // find customer with id from db
    const customer = await Customer.findByPk(customerId);

    // if customer doesn't exist in db then do nothing
    if (!customer) {
      return res.redirect("/customer");
    }

    // render the edit customer info template
    res.render("customer/edit-customer", {
      pageTitle: "Edit Customer",
      path: "/customer",
      editing: editMode,
      customer: customer,
      amountTypes: amountTypes,
    });
  } catch (reason) {
    console.log(
      "Error: in getEditCustomer controller with reason --> ",
      reason
    );
  }
};

// update existing customer info in db
exports.postEditCustomer = async (req, res, next) => {
  // get all customer info from request params
  const customerId = req.body.customerId;
  const updateName = req.body.name;
  const updateAddress = req.body.address;
  const updatePhoneNumber = req.body.phoneNumber;
  const updateBalance = req.body.balance;
  const updateAmountType = req.body.amountType;

  try {
    // find customer by customer id in db
    const customer = await Customer.findByPk(customerId);

    // update customer info
    customer.name = updateName;
    customer.address = updateAddress;
    customer.phoneNumber = updatePhoneNumber;
    customer.balance = updateBalance;
    customer.amountTypeId = updateAmountType;

    // update customer info in db now
    await customer.save();

    // render all customer template with updated data
    console.log("UPDATED Customer!");
    res.redirect("/customer");
  } catch (reason) {
    console.log(
      "Error: in postEditCustomer controller with reason --> ",
      reason
    );
  }
};

// delete customer from db
exports.postDeleteCustomer = async (req, res, next) => {
  // get customerId from request params
  const customerId = req.body.customerId;

  try {
    // find customer in db first
    const customer = await Customer.findByPk(customerId);

    // delete customer in db
    await customer.destroy();

    // render the customer template now with updated settings
    console.log("DESTROYED PRODUCT");
    res.redirect("/customer");
  } catch (reason) {
    console.log(
      "Error: in postDeleteCustomer controller with reason --> ",
      reason
    );
  }
};

// create customer khata from stock book and cash book
exports.getCustomersKhata = async (req, res, next) => {
  // get customer id from request params first
  const customerId = req.params.customerId;

  // find customer by in db
  const customer = await Customer.findByPk(customerId);
  // if we don't find customer then do nothing in that case
  if (!customer) {
    return res.redirect("/customer");
  }

  // create customer information array first
  const customerDetails = [];

  // initiate customer balance from customer starting balance
  let customerBalance = customer.startingBalance;

  // add starting stock to first array
  customerDetails.push({
    startingBalance: customerBalance,
  });

  // get customer stock buy details
  const stockBookDetails = await customer.getStockBook({
    include: [
      { model: Size, as: "size" },
      { model: Pattern, as: "pattern" },
    ],
    order: [["id", "ASC"]],
  });

  // get customer credit and debit details
  const cashBookDetails = await customer.getCashBook({
    include: [{ model: BankAccount, as: "bankAccount" }],
  });
  // add starting stock to first array
  // customerDetails.push({
  //   customerBalance: customerBalance,
  // });

  // arrange stock details first
  for (let i of stockBookDetails) {
    customerBalance =
      i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      i.customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
        ? Number(customerBalance) -
          Number(i.amount) * (i.qty % 2 === 0 ? i.qty / 2 : i.qty)
        : 0;

    customerDetails.push({
      Date: i.updatedAt,
      entryType: i.entryType,
      qty: i.qty,
      pattern:
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          ? i.pattern.name
          : i.pattern,
      size:
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          ? i.size.type
          : i.size,
      credit:
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
          ? i.amount
          : 0,
      debit:
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
          ? i.amount
          : i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          ? Number(i.amount) * (i.qty % 2 === 0 ? i.qty / 2 : i.qty)
          : 0,
      amount: i.amount,
      balance: customerBalance,
    });
  }
  console.log("check here the details ", customerDetails);
  customerBalance =
    customerDetails.length > 1
      ? customerDetails[customerDetails.length - 1].balance
      : customerDetails[customerDetails.length - 1].startingBalance;
  // need to use while loop then
  // now arrange cash book details
  for (let i of cashBookDetails) {
    customerBalance =
      (i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      i.customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
        ? Number(customerBalance) + Number(i.amount)
        : 0;
    customerDetails.push({
      Date: i.updatedAt,
      entryType: i.entryType,
      paymentType: i.paymentType,
      bankDetails:
        (i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
          i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
        i.paymentType !== CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH
          ? i.bankAccount.accountName
          : i.bankAccount,
      credit:
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
          ? i.amount
          : 0,
      debit:
        i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
          ? i.amount
          : 0,
      amount: i.amount,
      balance: customerBalance,
    });
  }
  res.render("customer/customer-khata.ejs", {
    customerDetails: customerDetails,
    customer: customer,
    pageTitle: customer.name + " Khata",
    path: "/customer",
  });
};
