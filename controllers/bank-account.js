// import models and config files
const { BankAccount, Bank, Customer } = require("../models");
const { CONSTANTS } = require("../config/constants");

// get all bank accounts
exports.getAllBankAccount = async (req, res, next) => {
  try {
    // get all bank accounts from db
    const bankAccounts = await BankAccount.findAll({
      include: [{ model: Bank, as: "bank" }],
      order: [["id", "DESC"]],
    });

    // render all bank account template
    res.render("bank-account/bank-account.ejs", {
      bankAccounts: bankAccounts,
      pageTitle: "All Bank Accounts",
      path: "/bank-account",
    });
  } catch (reason) {
    console.log(
      "Error: in getAllBankAccount controller with reason --> ",
      reason
    );
  }
};

// get add new bank screen
exports.addBankAccount = async (req, res, next) => {
  try {
    // get all bank accounts
    const allBanks = await Bank.findAll();

    // render new bank account with bank data included
    res.render("bank-account/edit-bank-account", {
      pageTitle: "Add BankAccount",
      path: "/bank-account",
      editing: false,
      banks: allBanks,
    });
  } catch (reason) {
    console.log("Error: in addBankAccount controller with reason --> ", reason);
  }
};

// add new bank account details to db
exports.postAddBankAccount = async (req, res, next) => {
  // get all details from request params
  const bankId = req.body.bankName;
  const accountName = req.body.accountName;
  const accountNumber = req.body.accountNumber;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const startingBalance = req.body.startingBalance;

  try {
    // check if all field filled with data
    if (
      bankId &&
      accountName &&
      accountNumber &&
      address &&
      phoneNumber &&
      startingBalance
    )
      // create new bank account with details
      await BankAccount.create({
        accountName: accountName,
        accountNumber: accountNumber,
        address: address,
        phoneNumber: phoneNumber,
        bankId: bankId,
        startingBalance: startingBalance,
        balance: startingBalance,
      });

    // render all bank account screen on creation
    console.log("Created BankAccount");
    res.redirect("/bank-account");
  } catch (reason) {
    console.log(
      "Error: in postAddBankAccount controller with reason --> ",
      reason
    );
  }
};

// get edit screen for existing bank account
exports.getEditBankAccount = async (req, res, next) => {
  // get editMode from request params
  const editMode = req.query.edit;

  // if editMode was false then do nothing
  if (!editMode) {
    return res.redirect("/bank-account");
  }

  // get bankAccountId from request params
  const bankAccountId = req.params.bankAccountId;

  try {
    // get all banks for updating bank for bank account
    let banks = await Bank.findAll();

    // get bank Account with id to update
    const bankAccount = await BankAccount.findByPk(bankAccountId);

    // if we don't find the bank account with the id then do nothing
    if (!bankAccount) {
      return res.redirect("/bank-account");
    }

    // render edit bank account screen
    res.render("bank-account/edit-bank-account", {
      pageTitle: "Edit BankAccount",
      path: "/bank-account",
      editing: editMode,
      bankAccount: bankAccount,
      banks: banks,
    });
  } catch (reason) {
    console.log(
      "Error: in getEditBankAccount controller with reason --> ",
      reason
    );
  }
};

// update bankAccount details in db
exports.postEditBankAccount = async (req, res, next) => {
  // get all details from request params
  const bankAccountId = req.body.bankAccountId;
  const updatedBankId = req.body.bankName;
  const updatedAccountName = req.body.accountName;
  const updatedAccountNumber = req.body.accountNumber;
  const updatedAddress = req.body.address;
  const updatedPhoneNumber = req.body.phoneNumber;
  const updatedStartingBalance = req.body.startingBalance;
  const updatedBalance = req.body.balance;

  try {
    // find bank account with the id from the request
    const bankAccount = await BankAccount.findByPk(bankAccountId);

    // update the detail with request data
    bankAccount.accountName = updatedAccountName;
    bankAccount.accountNumber = updatedAccountNumber;
    bankAccount.bankId = updatedBankId;
    bankAccount.address = updatedAddress;
    bankAccount.phoneNumber = updatedPhoneNumber;
    bankAccount.startingBalance = updatedStartingBalance;
    bankAccount.balance = updatedBalance;

    // update the details in db
    await bankAccount.save();

    // render the bank accounts screen on update
    console.log("UPDATED BankAccount!");
    res.redirect("/bank-account");
  } catch (reason) {
    console.log(
      "Error: in postEditBankAccount controller with reason --> ",
      reason
    );
  }
};

// delete the found bank account
exports.postDeleteBankAccount = async (req, res, next) => {
  // get bank account id from request params
  const bankAccountId = req.body.bankAccountId;

  try {
    // find bank account with id
    const bankAccount = await BankAccount.findByPk(bankAccountId);

    // delete found  bank account
    await bankAccount.destroy();

    // render the all bank accounts screen
    console.log("DESTROYED PRODUCT");
    res.redirect("/bank-account");
  } catch (reason) {
    console.log(
      "Error: in postDeleteBankAccount controller with reason --> ",
      reason
    );
  }
};

// need to add the details for bank khata
exports.getBankAccountKhata = (req, res, next) => {
  const bankAccountId = req.params.bankAccountId;
  BankAccount.findByPk(bankAccountId)
    .then(async (bankAccount) => {
      if (!bankAccount) {
        return res.redirect("/bank-account");
      }
      const bankAccountDetails = [];
      let bankAccountBalance = 0;
      const RoznamchaDetails = await bankAccount.getRoznamchas({
        include: [Customer],
        order: [["id", "ASC"]],
      });

      for (let [key, value] of RoznamchaDetails.entries()) {
        bankAccountBalance =
          value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
            ? Number(bankAccountBalance) + Number(value.amount)
            : value.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
            ? Number(bankAccountBalance) - Number(value.amount)
            : Number(bankAccountBalance);

        bankAccountDetails.push({
          Date: value.updatedAt,
          customerDetails: value.customer.name,
          paymentType: value.paymentType,
          credit:
            value.entryType ===
            CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
              ? value.amount
              : 0,
          debit:
            value.entryType ===
            CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
              ? value.amount
              : 0,
          balance: bankAccountBalance,
        });
      }

      res.render("bank-account/bank-account-khata.ejs", {
        bankAccountDetails: bankAccountDetails,
        bankAccount: bankAccount,
        pageTitle: bankAccount.accountName,
        path: "/bank-account",
      });
    })
    .catch((err) => console.log(err));
};
