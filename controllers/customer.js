const { Customer, AmountType } = require("../models");
const BankAccount = require("../models/old models/bank-account");
const { CONSTANTS } = require("../config/constants");
const Pattern = require("../models/old models/pattern1");
const Size = require("../models/old models/size1");

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

// need to add the comments after cash book and stock book
exports.getCustomersKhata = (req, res, next) => {
  const customerId = req.params.customerId;
  Customer.findByPk(customerId)
    .then(async (customer) => {
      if (!customer) {
        return res.redirect("/customer");
      }
      const customerDetails = [];
      let customerBalance = 0;
      const RoznamchaDetails = await customer.getRoznamchas({
        include: [BankAccount, Pattern, Size],
        order: [["id", "ASC"]],
      });

      for (let i of RoznamchaDetails) {
        customerBalance =
          i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
            ? Number(customerBalance) + Number(i.amount)
            : i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
            ? Number(customerBalance) + Number(i.amount)
            : i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
              i.customerType ===
                CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
            ? Number(customerBalance) -
              Number(i.amount) * (i.qty % 2 === 0 ? i.qty / 2 : i.qty)
            : 0;

        customerDetails.push({
          Date: i.updatedAt,
          entryType: i.entryType,
          paymentType: i.paymentType,
          qty: i.qty,
          pattern:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? i.pattern.name
              : i.pattern,
          size:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? i.size.type
              : i.size,
          bankDetails:
            (i.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
              i.entryType ===
                CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
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
              : i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? Number(i.amount) * (i.qty % 2 === 0 ? i.qty / 2 : i.qty)
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
    })
    .catch((err) => console.log(err));
};
