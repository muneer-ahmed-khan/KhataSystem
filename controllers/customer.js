const Customer = require("../models/customer");
const BankAccount = require("../models/bank-account");
const Bank = require("../models/bank");
const EntryType = require("../models/entry-type");

exports.getCustomers = (req, res, next) => {
  Customer.findAll({ order: [["id", "DESC"]] })
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

exports.addCustomer = (req, res, next) => {
  res.render("customer/edit-customer", {
    pageTitle: "Add Customer",
    path: "/add-customer",
    editing: false,
  });
};

exports.postAddCustomer = (req, res, next) => {
  const name = req.body.name;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const balance = req.body.balance;

  Customer.create({
    name: req.body.name,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    balance: req.body.balance,
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

exports.getEditCustomer = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/customer");
  }
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

  Customer.findByPk(customerId)
    .then((customer) => {
      customer.name = updateName;
      customer.address = updateAddress;
      customer.phoneNumber = updatePhoneNumber;
      customer.balance = updateBalance;
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
      let customerBalance = customer.balance;
      const RoznamchaDetails = await customer.getRoznamchas({
        include: [BankAccount, EntryType],
      });

      for (let i of RoznamchaDetails) {
        (customerBalance =
          i.entryType.type === "Credit"
            ? Number(customerBalance) + Number(i.amount)
            : i.entryType.type === "Debit"
            ? Number(customerBalance) - Number(i.amount)
            : 0),
          customerDetails.push({
            Date: i.updatedAt,
            bankDetails: i.bankAccount.accountName,
            credit: i.entryType.type === "Credit" ? i.amount : 0,
            debit: i.entryType.type === "Debit" ? i.amount : 0,
            balance: customerBalance,
          });
      }
      console.log(customerDetails);
      res.render("customer/customer-khata.ejs", {
        customerDetails: customerDetails,
        customer: customer,
        pageTitle: customer.name + " Khata",
        path: "/customer",
      });
    })
    .catch((err) => console.log(err));
};
