const Customer = require("../models/customer");
const BankAccount = require("../models/bank-account");
const AmountType = require("../models/amount-type");
const { CONSTANTS } = require("../config/constants");
const Pattern = require("../models/pattern");
const Size = require("../models/size");

exports.getCustomers = (req, res, next) => {
  Customer.findAll({ include: [AmountType], order: [["id", "DESC"]] })
    .then((customers) => {
      res.render("customer/customer.ejs", {
        customers: customers,
        pageTitle: "All Customers",
        path: "/customer",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addCustomer = async (req, res, next) => {
  // get amount types for customer
  const amountTypes = await AmountType.findAll({ order: [["id", "DESC"]] });
  res.render("customer/edit-customer", {
    pageTitle: "Add Customer",
    path: "/add-customer",
    editing: false,
    amountTypes: amountTypes,
  });
};

exports.postAddCustomer = (req, res, next) => {
  const name = req.body.name;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const balance = req.body.balance;
  const amountType = req.body.amountType;

  Customer.create({
    name: name,
    address: address,
    phoneNumber: phoneNumber,
    balance: balance,
    amountTypeId: amountType,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created Customer");
      res.redirect("/customer");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditCustomer = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/customer");
  }
  const amountTypes = await AmountType.findAll({ order: [["id", "DESC"]] });
  const customerId = req.params.customerId;
  Customer.findByPk(customerId)
    .then((customer) => {
      if (!customer) {
        return res.redirect("/customer");
      }
      res.render("customer/edit-customer", {
        pageTitle: "Edit Customer",
        path: "/edit-customer",
        editing: editMode,
        customer: customer,
        amountTypes: amountTypes,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditCustomer = (req, res, next) => {
  const customerId = req.body.customerId;
  const updateName = req.body.name;
  const updateAddress = req.body.address;
  const updatePhoneNumber = req.body.phoneNumber;
  const updateBalance = req.body.balance;
  const updateAmountType = req.body.amountType;

  Customer.findByPk(customerId)
    .then((customer) => {
      customer.name = updateName;
      customer.address = updateAddress;
      customer.phoneNumber = updatePhoneNumber;
      customer.balance = updateBalance;
      customer.amountTypeId = updateAmountType;
      return customer.save();
    })
    .then((result) => {
      console.log("UPDATED Customer!");
      res.redirect("/customer");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteCustomer = (req, res, next) => {
  const customerId = req.body.customerId;
  Customer.findByPk(customerId)
    .then((customer) => {
      return customer.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/customer");
    })
    .catch((err) => console.log(err));
};

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
