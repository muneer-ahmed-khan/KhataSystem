// import all models and local files
const {
  CashBook,
  BankAccount,
  Customer,
  AmountType,
  Sequelize,
} = require("../models");
const { CONSTANTS } = require("../config/constants");
const { Op } = require("sequelize");

// get all cash book details
exports.getCashBook = async (req, res, next) => {
  try {
    // get all cash books
    const cashBooks = await CashBook.findAll({
      include: [
        {
          model: BankAccount,
          as: "bankAccount",
        },
        {
          model: Customer,
          as: "customer",
        },
      ],
      order: [["id", "DESC"]],
    });

    // render the all cash book template now
    res.render("cash-book/cash-book.ejs", {
      cashBooks: cashBooks,
      pageTitle: "Cash Book",
      path: "/cash-book",
    });
  } catch (reason) {
    console.log("Error: in getCashBook controller with reason --> ", reason);
  }
};

// get add new cash book page
exports.addCashBook = async (req, res, next) => {
  // get the type of entry from request params
  let entryType =
    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT in req.query
      ? CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
      : CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT;

  // declare global function variables
  let customers,
    customerTypes,
    paymentTypes,
    bankAccounts = null;

  try {
    // on credit type show only those customers that have amount type Credit or both or DebitType show only Debit accounts
    customers =
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.BOTH
        ? await Customer.findAll({
            include: {
              model: AmountType,
              as: "amountType",
              where: {
                [Op.or]: [
                  {
                    type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
                  },
                  {
                    type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.CREDIT,
                  },
                ],
              },
            },
            order: [
              ["name", "ASC"],
              [{ model: AmountType, as: "amountType" }, "type", "DESC"],
            ],
          })
        : entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
        ? await Customer.findAll({
            include: {
              model: AmountType,
              as: "amountType",
              where: {
                type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.DEBIT,
              },
            },
          })
        : [];

    // get all bank accounts and payment types
    bankAccounts = await BankAccount.findAll({
      order: [["accountName", "ASC"]],
    });
    paymentTypes = CashBook.rawAttributes.paymentType.values;
    customerTypes = CashBook.rawAttributes.customerType.values;

    // render add new cash book template
    res.render("cash-book/edit-cash-book", {
      pageTitle: "Add to Cash Book",
      path: "/cash-book",
      editing: false,
      customers: customers,
      customerTypes: customerTypes,
      paymentTypes: paymentTypes,
      bankAccounts: bankAccounts,
      entryType: entryType,
    });
  } catch (reason) {
    console.log("Error: in addCashBook controller with reason --> ", reason);
  }
};

// add new cash book to db
exports.postAddCashBook = async (req, res, next) => {
  // create function global variables
  let amount,
    customerType,
    paymentType,
    cashCustomer,
    customerId,
    bankAccountId = null;

  // get entryType from request params
  const entryType = req.body.entryType.trim();

  // get data from request params
  customerId = req.body.customer;
  cashCustomer = req.body.cashCustomer;
  customerType = req.body.customerType;
  paymentType = req.body.paymentType;
  if (paymentType !== CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH)
    bankAccountId = req.body.bankAccount;
  amount = req.body.amount;

  try {
    // update Bank Khata only while entryType is credit amount
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT &&
      bankAccountId
    ) {
      // find bank account by id from db
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );

      // add the credit amount to bankAccount balance
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) + Number(amount);

      // update bank account info in db
      await UpdateBankAccountBalance.save();
    }
    // update Bank Khata only while entryType is debit amount
    else if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT &&
      bankAccountId
    ) {
      // find bank account by id from db
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );

      // remove debit amount from bank account balance
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) - Number(amount);

      // update bank account info in db
      await UpdateBankAccountBalance.save();
    }

    // update Customer info only while receive amount and only for nonCash/Khata customers
    if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      customerId
    ) {
      // find customer in db by id
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      // if it was credit amount entry then add to customer balance
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) + Number(amount);
      }
      // if it was debit amount entry then remove from customer balance
      else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
      ) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - Number(amount);
      }

      // update customer info in db
      await UpdateCustomerBalance.save();
    }

    // add new cash book entry to db
    const entry = await CashBook.create({
      entryType: entryType,
      customerType: customerType,
      paymentType: paymentType,
      amount: amount,
      customerId: customerId,
      cashCustomer: cashCustomer,
      bankAccountId: bankAccountId,
    });

    // render all cash book template
    console.log("Created Cash Book Entry Successfully");
    // res.redirect("/cash-book");
    // handle ajax request response here it will redirect to main page
    res.send(req.protocol + "://" + req.get("host") + "/cash-book");
  } catch (reason) {
    res.status(404).send("Error: in postAddCashBook controller with reason ");
    console.log(
      "Error: in postAddCashBook controller with reason --> ",
      reason
    );
  }
};

// edit the existing cash book
exports.getEditCashBook = async (req, res, next) => {
  // check the editMode in request params
  const editMode = req.query.edit;

  // if editMode is false then do nothing
  if (!editMode) {
    return res.redirect("/cash-book");
  }

  // get entry type from request params
  const entryType = req.query.entryType.trim();

  // define function global variables
  let customers,
    customerTypes,
    paymentTypes,
    bankAccounts = null;
  try {
    // get credit customers in case of credit or both and get debit customers in case of debit
    customers =
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
        ? await Customer.findAll({
            include: {
              model: AmountType,
              as: "amountType",
              where: {
                [Op.or]: [
                  {
                    type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
                  },
                  {
                    type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.CREDIT,
                  },
                ],
              },
            },
            order: [["name", "ASC"]],
          })
        : entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
        ? await Customer.findAll({
            include: {
              model: AmountType,
              as: "amountType",
              where: {
                type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.DEBIT,
              },
            },
          })
        : [];

    // get bank accounts and customer types and payment types
    bankAccounts = await BankAccount.findAll();
    paymentTypes = CashBook.rawAttributes.paymentType.values;
    customerTypes = CashBook.rawAttributes.customerType.values;

    // get cash book id from request params
    const cashBookId = req.params.cashBookId;
    const cashBook = await CashBook.findByPk(cashBookId);

    // if there was no data found for the cash book then do nothing
    if (!cashBook) {
      return res.redirect("/cash-book");
    }

    // render the edit cash book template
    res.render("cash-book/edit-cash-book", {
      pageTitle: "Edit Cash Book",
      path: "/cash-book",
      editing: editMode,
      cashBook: cashBook,
      customers: customers,
      customerTypes: customerTypes,
      paymentTypes: paymentTypes,
      bankAccounts: bankAccounts,
      entryType: entryType,
    });
  } catch (reason) {
    console.log(
      "Error: in getEditCashBook controller with reason --> ",
      reason
    );
  }
};

// update existing cash book info in db
exports.postEditCashBook = async (req, res, next) => {
  // define global function variable
  let amount,
    customerType,
    cashCustomer,
    paymentType,
    customerId,
    bankAccountId = null;

  // get entrytype from the request params
  const entryType = req.body.entryType.trim();

  // get data variable from request params
  customerId = req.body.customer;
  bankAccountId = req.body.bankAccount;
  paymentType = req.body.paymentType;
  amount = req.body.amount;
  customerType = req.body.customerType;
  cashCustomer = req.body.cashCustomer;

  try {
    // get cash book from request params
    console.log("check ", cashBookId);

    let cashBookId = req.body.cashBookId;
    const cashBook = await CashBook.findByPk(cashBookId);

    // update Bank Khata only while entryType is credit amount or debit amount
    // when entry is credit or debit payment is not cash old payment is also not cash and having bank id
    if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      paymentType !== CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH &&
      cashBook.paymentType !== CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH &&
      bankAccountId
    ) {
      // find bankAccount by id from db
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );

      // if it credit amount use case
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT) {
        const updatedBalance = Number(amount) - Number(cashBook.amount);
        console.log(
          "if condition credit mode bank update ",
          UpdateBankAccountBalance.balance,
          updatedBalance
        );
        UpdateBankAccountBalance.balance =
          Number(UpdateBankAccountBalance.balance) + Number(updatedBalance);
      }
      // if it is debit amount use case
      else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
      ) {
        // if current new balance is less then old balance then add to balance else minus from balance
        UpdateBankAccountBalance.balance =
          Number(amount) < Number(cashBook.amount)
            ? Number(UpdateBankAccountBalance.balance) +
              (Number(cashBook.amount) - Number(amount))
            : Number(UpdateBankAccountBalance.balance) -
              (Number(amount) - Number(cashBook.amount));
      }

      // save bank account updated balance in db
      await UpdateBankAccountBalance.save();
    }

    // handle the use case while use update payment type from bank methods to Cash
    // when credit or debit amount old payment type is not equal new payment type new payment is cash
    else if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      cashBook.paymentType !== paymentType &&
      !bankAccountId &&
      cashBook.bankAccountId
    ) {
      // find bank account with old id first
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        cashBook.bankAccountId
      );
      console.log(
        "else if first condition from nonCash to Cash bank update ",
        UpdateBankAccountBalance.balance,
        Number(cashBook.amount)
      );

      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT)
        UpdateBankAccountBalance.balance =
          Number(UpdateBankAccountBalance.balance) - Number(cashBook.amount);
      else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT)
        UpdateBankAccountBalance.balance =
          Number(UpdateBankAccountBalance.balance) + Number(cashBook.amount);

      // update new balance in bank account in db
      await UpdateBankAccountBalance.save();
    }
    // handle the use case while use update payment type from Cash to bank methods
    // when credit or debit entry and old payment type is not equal to new old method is cash
    else if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      cashBook.paymentType !== paymentType &&
      bankAccountId &&
      !cashBook.bankAccountId
    ) {
      // bank account by bankAccountId in db
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );

      console.log(
        "else if second condition from Cash to nonCash bank update ",
        UpdateBankAccountBalance.balance,
        Number(cashBook.amount)
      );
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT)
        UpdateBankAccountBalance.balance =
          Number(UpdateBankAccountBalance.balance) + Number(cashBook.amount);
      else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT)
        UpdateBankAccountBalance.balance =
          Number(UpdateBankAccountBalance.balance) - Number(cashBook.amount);

      // save the updated info in db
      await UpdateBankAccountBalance.save();
    }

    // update Customer info only while customer type change from non Cash --> cash
    if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      customerType !== cashBook.customerType &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH
    ) {
      // update back customer balance in that case
      const UpdateCustomerBalance = await Customer.findByPk(
        cashBook.customerId
      );

      // handle the use case while entry type is credit
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - Number(cashBook.amount);
      }
      // handle the use case while entry type is debit
      else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
      ) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - Number(cashBook.amount);
      }

      // update the updated info in db now
      await UpdateCustomerBalance.save();
    }

    // update Customer info only while customer type change from  cash --> non Cash
    if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      customerType !== cashBook.customerType &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
    ) {
      // update back customer balance in that case
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      // handle the use case while entry type is credit
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) + Number(amount);
      }
      // handle the use case while entry type is debit
      else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
      ) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) + Number(amount);
      }

      // update the updated info in db now
      await UpdateCustomerBalance.save();
    }

    // update Customer info only while receive amount and only for non cash customers and same customer update
    if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      customerType === cashBook.customerType &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH &&
      customerId === cashBook.customerId
    ) {
      // find customer by id in db
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      // handle the use case while entry type is credit
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT) {
        const updateBalance = Number(amount) - Number(cashBook.amount);
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) + updateBalance;
      }
      // handle the use case while entry type is debit
      else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
      ) {
        UpdateCustomerBalance.balance =
          Number(amount) < Number(cashBook.amount)
            ? Number(UpdateCustomerBalance.balance) -
              (Number(cashBook.amount) - Number(amount))
            : Number(UpdateCustomerBalance.balance) +
              (Number(amount) - Number(cashBook.amount));
      }

      // update the updated info in db now
      await UpdateCustomerBalance.save();
    }
    // update Customer info only while receive amount and only for non cash customers and existing customer update by new one
    else if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      customerType === cashBook.customerType &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH &&
      customerId !== cashBook.customerId
    ) {
      // first update the old customer
      let UpdateOldCustomerBalance = await Customer.findByPk(
        cashBook.customerId
      );

      // update old customer balance to back to old balance
      UpdateOldCustomerBalance.balance =
        Number(UpdateOldCustomerBalance.balance) - Number(cashBook.amount);

      // update the updated info in db now
      await UpdateOldCustomerBalance.save();

      // find customer by id in db
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      // handle the use case while entry type is credit
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) + Number(amount);

      // update the updated info in db now
      await UpdateCustomerBalance.save();
    }

    // update roznamcha entry with new updates
    cashBook.entryType = entryType;
    cashBook.customerType = customerType;
    cashBook.paymentType = paymentType;
    cashBook.amount = amount;
    cashBook.customerId = customerId ? customerId : null;
    cashBook.bankAccountId = bankAccountId ? bankAccountId : null;
    cashBook.cashCustomer = cashCustomer;

    // update roznamcha now
    await cashBook.save();

    // show all updated information on cash book
    console.log("UPDATED Cash Book!");
    // res.redirect("/cash-book");
    res.send(req.protocol + "://" + req.get("host") + "/cash-book");
  } catch (reason) {
    res.status(404).send("Error: in postEditCashBook controller with reason ");
    console.log(
      "Error: in postEditCashBook controller with reason --> ",
      reason
    );
  }
};

// remove a cash book entry from db
exports.postDeleteCashBook = async (req, res, next) => {
  // get cashbook id from request params
  const cashBookId = req.body.cashBookId;
  try {
    // get cashbook from db first
    const cashBook = await CashBook.findByPk(cashBookId);

    const entryType = cashBook.entryType;
    const bankAccountId = cashBook.bankAccountId;
    const amount = cashBook.amount;
    const customerId = cashBook.customerId;

    // update Bank Khata only while entryType is credit amount
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT &&
      bankAccountId
    ) {
      // get bank account data from db
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );

      // reverse back the account balance
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) - Number(amount);

      // update the new balance in bank account
      await UpdateBankAccountBalance.save();
    }
    // update Bank Khata only while entryType is debit amount
    else if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT &&
      bankAccountId
    ) {
      // get bank account data from db
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );

      // add back the amount in bank khata
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) + Number(amount);

      // update the info in db
      await UpdateBankAccountBalance.save();
    }

    // update Customer info only while receive amount and only for non cash customers
    if (
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
      customerId
    ) {
      // find customer by id first
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      // if entry type was credit amount
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT) {
        // then reverse back the amount from customer account
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - Number(amount);
      }
      // if the entry type was debit amount
      else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
      ) {
        // minus back the amount from the customer account
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - Number(amount);
      }

      // update customer info in db back
      await UpdateCustomerBalance.save();
    }

    // delete entry from db
    await cashBook.destroy();

    // render back the main template
    console.log("DESTROYED Cash Book");
    res.redirect("/cash-book");
  } catch (reason) {
    console.log(
      "Error: in postDeleteCashBook controller with reason --> ",
      reason
    );
  }
};
