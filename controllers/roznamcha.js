const Customer = require("../models/customer");
const EntryType = require("../models/entry-type");
const BankAccount = require("../models/bank-account");
const Roznamcha = require("../models/roznamcha");
const pdfGenerator = require("../routes/pdfGenerator");

exports.getRoznamcha = (req, res, next) => {
  Roznamcha.findAll({
    include: [EntryType, BankAccount, Customer],
    order: [["id", "DESC"]],
  })
    .then(async (roznamchas) => {
      const pdf = new pdfGenerator(roznamchas);
      pdf.generate();
      res.render("roznamcha/roznamcha.ejs", {
        roznamchas: roznamchas,
        pageTitle: "All Entries",
        path: "/roznamcha",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addRoznamcha = async (req, res, next) => {
  const customers = await Customer.findAll();
  const bankAccounts = await BankAccount.findAll();
  const entryTypes = await EntryType.findAll();
  res.render("roznamcha/edit-roznamcha", {
    pageTitle: "Add Roznamcha",
    path: "/add-roznamcha",
    editing: false,
    customers: customers,
    bankAccounts: bankAccounts,
    entryTypes: entryTypes,
  });
};

exports.postAddRoznamcha = (req, res, next) => {
  const customer = req.body.customer;
  const bankAccount = req.body.bankAccount;
  const entryType = req.body.entryType;
  const amount = req.body.amount;
  try {
    const entry = Roznamcha.create({
      entryTypeId: entryType,
      amount: amount,
      customerId: customer,
      bankAccountId: bankAccount,
    });

    console.log("Created Roznamcha Entry Successfully");
    res.redirect("/roznamcha");
  } catch (err) {
    console.log("err in adding new roznamcha entry", err);
  }
};

exports.getEditRoznamcha = async (req, res, next) => {
  const customers = await Customer.findAll();
  const bankAccounts = await BankAccount.findAll();
  const entryTypes = await EntryType.findAll();
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/roznamcha");
  }
  const roznamchaId = req.params.roznamchaId;
  Roznamcha.findByPk(roznamchaId)
    .then((roznamcha) => {
      if (!roznamcha) {
        return res.redirect("/roznamcha");
      }
      res.render("roznamcha/edit-roznamcha", {
        pageTitle: "Edit Roznamcha",
        path: "/edit-roznamcha",
        editing: editMode,
        roznamcha: roznamcha,
        customers: customers,
        bankAccounts: bankAccounts,
        entryTypes: entryTypes,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditRoznamcha = (req, res, next) => {
  const roznamchaId = req.body.roznamchaId;
  const customer = req.body.customer;
  const bankAccount = req.body.bankAccount;
  const entryType = req.body.entryType;
  const amount = req.body.amount;
  Roznamcha.findByPk(roznamchaId)
    .then((roznamcha) => {
      roznamcha.entryTypeId = entryType;
      roznamcha.amount = amount;
      roznamcha.customerId = customer;
      roznamcha.bankAccountId = bankAccount;
      return roznamcha.save();
    })
    .then((result) => {
      console.log("UPDATED Roznamcha!");
      res.redirect("/roznamcha");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteRoznamcha = (req, res, next) => {
  const roznamchaId = req.body.roznamchaId;
  Roznamcha.findByPk(roznamchaId)
    .then((roznamcha) => {
      return roznamcha.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/roznamcha");
    })
    .catch((err) => console.log(err));
};
