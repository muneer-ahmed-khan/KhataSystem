const BankAccount = require("../models/bank-account");
const Bank = require("../models/bank");
const Customer = require("../models/customer");
const EntryType = require("../models/entry-type");

exports.getBankAccount = (req, res, next) => {
  BankAccount.findAll({ include: [Bank], order: [["id", "DESC"]] })
    .then((bankAccounts) => {
      res.render("bank-account/bank-account.ejs", {
        bankAccounts: bankAccounts,
        pageTitle: "All Bank Accounts",
        path: "/bank-account",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addBankAccount = (req, res, next) => {
  Bank.findAll().then((banks) => {
    res.render("bank-account/edit-bank-account", {
      pageTitle: "Add BankAccount",
      path: "/add-bank-account",
      editing: false,
      banks: banks,
    });
  });
};

exports.postAddBankAccount = (req, res, next) => {
  const bankId = req.body.bankName;
  const accountName = req.body.accountName;
  const accountNumber = req.body.accountNumber;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const balance = req.body.balance;
  BankAccount.create({
    accountName: accountName,
    accountNumber: accountNumber,
    address: address,
    phoneNumber: phoneNumber,
    bankId: bankId,
    balance: balance,
  })
    .then((result) => {
      //   console.log("chekc result ", result);
      console.log("Created BankAccount");
      res.redirect("/bank-account");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditBankAccount = async (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/bank-account");
  }
  const bankAccountId = req.params.bankAccountId;
  let banks = await Bank.findAll();
  BankAccount.findByPk(bankAccountId)
    .then((bankAccount) => {
      if (!bankAccount) {
        return res.redirect("/bank-account");
      }
      res.render("bank-account/edit-bank-account", {
        pageTitle: "Edit BankAccount",
        path: "/edit-bank-account",
        editing: editMode,
        bankAccount: bankAccount,
        banks: banks,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditBankAccount = (req, res, next) => {
  const bankAccountId = req.body.bankAccountId;
  const updatedBankId = req.body.bankName;
  const updatedAccountName = req.body.accountName;
  const updatedAccountNumber = req.body.accountNumber;
  const updatedAddress = req.body.address;
  const updatedPhoneNumber = req.body.phoneNumber;
  const updatedBalance = req.body.balance;
  BankAccount.findByPk(bankAccountId)
    .then((bankAccount) => {
      bankAccount.accountName = updatedAccountName;
      bankAccount.accountNumber = updatedAccountNumber;
      bankAccount.bankId = updatedBankId;
      bankAccount.address = updatedAddress;
      bankAccount.phoneNumber = updatedPhoneNumber;
      bankAccount.balance = updatedBalance;
      return bankAccount.save();
    })
    .then((result) => {
      console.log("UPDATED BankAccount!");
      res.redirect("/bank-account");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteBankAccount = (req, res, next) => {
  const bankAccountId = req.body.bankAccountId;
  BankAccount.findByPk(bankAccountId)
    .then((bankAccount) => {
      return bankAccount.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/bank-account");
    })
    .catch((err) => console.log(err));
};

exports.getBankAccountKhata = (req, res, next) => {
  const bankAccountId = req.params.bankAccountId;
  BankAccount.findByPk(bankAccountId)
    .then(async (bankAccount) => {
      if (!bankAccount) {
        return res.redirect("/bank-account");
      }
      const bankAccountDetails = [];
      let bankAccountBalance = bankAccount.balance;
      const RoznamchaDetails = await bankAccount.getRoznamchas({
        include: [Customer, EntryType],
      });
      for (let i of RoznamchaDetails) {
        (bankAccountBalance =
          i.entryType.type === "Credit"
            ? Number(bankAccountBalance) + Number(i.amount)
            : i.entryType.type === "Debit"
            ? Number(bankAccountBalance) - Number(i.amount)
            : 0),
          bankAccountDetails.push({
            Date: i.updatedAt,
            customerDetails: i.customer.name,
            credit: i.entryType.type === "Credit" ? i.amount : 0,
            debit: i.entryType.type === "Debit" ? i.amount : 0,
            balance: bankAccountBalance,
          });
      }
      console.log(bankAccountDetails);
      res.render("bank-account/bank-account-khata.ejs", {
        bankAccountDetails: bankAccountDetails,
        bankAccount: bankAccount,
        pageTitle: bankAccount.accountName,
        path: "/bank-account",
      });
    })
    .catch((err) => console.log(err));
};
