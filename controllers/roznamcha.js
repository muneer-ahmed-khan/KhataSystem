const Customer = require("../models/customer");
// const EntryType = require("../models/entry-type");
const BankAccount = require("../models/bank-account");
const Pattern = require("../models/pattern");
const Size = require("../models/size");
const Stock = require("../models/stock");
const Roznamcha = require("../models/roznamcha");
const { CONSTANTS } = require("../config/constants");
const { Op } = require("sequelize");

exports.getRoznamcha = (req, res, next) => {
  Roznamcha.findAll({
    include: [BankAccount, Customer, Pattern, Size],
    order: [["id", "DESC"]],
  })
    .then(async (roznamchas) => {
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
  const addStockType = req.query.addStock;
  const sellStockType = req.query.sellStock;
  const amountType = req.query.amount;

  console.log(
    "addStockType ",
    addStockType,
    "sellStockType ",
    sellStockType,
    " amountType ",
    amountType
  );

  let sizes,
    patterns,
    customers,
    customerTypes,
    paymentTypes,
    bankAccounts = null;

  if (addStockType || sellStockType) {
    if (addStockType) {
      sizes = await Size.findAll({});
      patterns = await Pattern.findAll();
    }
    if (sellStockType) {
      // if we have sell stock then get only those sizes and pattern that are in stock
      sizes = await Size.findAll({
        include: [
          {
            model: Stock,
            where: {
              sizeId: {
                [Op.ne]: null,
              },
            },
          },
        ],
      });

      patterns = await Pattern.findAll({
        include: [
          {
            model: Stock,
            where: {
              patternId: {
                [Op.ne]: null,
              },
            },
          },
        ],
      });

      customers = await Customer.findAll();
      customerTypes = Roznamcha.rawAttributes.customerType.values;
    }
  } else if (amountType) {
    customers = await Customer.findAll();
    bankAccounts = await BankAccount.findAll();
    paymentTypes = Roznamcha.rawAttributes.paymentType.values;
  }

  res.render("roznamcha/edit-roznamcha", {
    pageTitle: "Add Roznamcha",
    path: "/add-roznamcha",
    editing: false,
    customers: sellStockType || amountType ? customers : [],
    customerTypes: customerTypes,
    paymentTypes: paymentTypes,
    bankAccounts: amountType ? bankAccounts : [],
    patterns: addStockType || sellStockType ? patterns : [],
    sizes: addStockType || sellStockType ? sizes : [],
    addStockType: addStockType,
    sellStockType: sellStockType,
    amountType: amountType,
  });
};

exports.postAddRoznamcha = async (req, res, next) => {
  let sizeId,
    patternId,
    qty,
    truckNumber,
    amount,
    customerType,
    paymentType,
    cashCustomer,
    customerId,
    bankAccountId,
    location = null;

  const entryType = req.body.entryType;

  if (
    entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK ||
    entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
  ) {
    sizeId = req.body.size;
    patternId = req.body.pattern;
    qty = req.body.qty;
    amount = req.body.amount;
    // truck number only for add stock entry
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK)
      truckNumber = req.body.truckNumber;
    // customer and customer entry for sell stock entry
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      customerId = req.body.customer;
      customerType = req.body.customerType;
      if (customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH)
        cashCustomer = req.body.cashCustomer;
    }
  } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT) {
    customerId = req.body.customer;
    bankAccountId = req.body.bankAccount;
    paymentType = req.body.paymentType;
    amount = req.body.amount;
  }

  try {
    const entry = await Roznamcha.create({
      entryType: entryType,
      customerType: customerType,
      paymentType: paymentType,
      truckNumber: truckNumber,
      qty: qty,
      amount: amount,
      location: location,
      sizeId: sizeId,
      patternId: patternId,
      customerId: customerId,
      cashCustomer: cashCustomer,
      bankAccountId: bankAccountId,
    });

    // update Bank Khata only while entryType is amount
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT &&
      bankAccountId
    ) {
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) + Number(amount);
      await UpdateBankAccountBalance.save();
    }

    // update Customer info only while sell stock or receive amount and only for non cash customers
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT ||
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
        customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH)
    ) {
      const UpdateCustomerBalance = await Customer.findByPk(customerId);
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) -
          Number(amount) *
            (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty));
      } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) + Number(amount);
      }
      await UpdateCustomerBalance.save();
    }

    // update stock while entry type is add stock and sell stock
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK ||
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
    ) {
      const [createOrUpdateStock, created] = await Stock.findOrCreate({
        where: { patternId: patternId, sizeId: sizeId },
        defaults: {
          patternId: patternId,
          sizeId: sizeId,
          total: qty,
        },
      });
      // check if the stock is already exist then add to total stock or remove from stock
      if (
        !created &&
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
      ) {
        createOrUpdateStock.total =
          Number(createOrUpdateStock.total) + Number(qty);
        await createOrUpdateStock.save();
      } else if (
        !created &&
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
      ) {
        createOrUpdateStock.total =
          Number(createOrUpdateStock.total) - Number(qty);
        await createOrUpdateStock.save();
      }
    }

    console.log("Created Roznamcha Entry Successfully");
    res.redirect("/roznamcha");
  } catch (err) {
    console.log("err in adding new roznamcha entry", err);
  }
};

exports.getEditRoznamcha = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/roznamcha");
  }
  const entryType = req.query.entryType;

  let sizes,
    patterns,
    customers,
    customerTypes,
    paymentTypes,
    bankAccounts = null;

  if (
    entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK ||
    entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
  ) {
    sizes = await Size.findAll();
    patterns = await Pattern.findAll();
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      customers = await Customer.findAll();
      customerTypes = Roznamcha.rawAttributes.customerType.values;
    }
  } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT) {
    customers = await Customer.findAll();
    bankAccounts = await BankAccount.findAll();
    paymentTypes = Roznamcha.rawAttributes.paymentType.values;
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
        customerTypes: customerTypes,
        paymentTypes: paymentTypes,
        bankAccounts: bankAccounts,
        sizes: sizes,
        patterns: patterns,
        addStockType:
          entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
            ? CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
            : "",
        sellStockType:
          entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
            ? CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
            : "",
        amountType:
          entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT
            ? CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT
            : "",
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditRoznamcha = async (req, res, next) => {
  let sizeId,
    patternId,
    qty,
    truckNumber,
    amount,
    customerType,
    cashCustomer,
    paymentType,
    customerId,
    bankAccountId,
    location = null;

  const entryType = req.body.entryType;

  if (
    entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK ||
    entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
  ) {
    sizeId = req.body.size;
    patternId = req.body.pattern;
    qty = req.body.qty;
    amount = req.body.amount;
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK)
      truckNumber = req.body.truckNumber;
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      customerId = req.body.customer;
      customerType = req.body.customerType;
      if (customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH)
        cashCustomer = req.body.cashCustomer;
    }
  } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT) {
    customerId = req.body.customer;
    bankAccountId = req.body.bankAccount;
    paymentType = req.body.paymentType;
    amount = req.body.amount;
  }

  try {
    const roznamchaId = req.body.roznamchaId;
    const roznamcha = await Roznamcha.findByPk(roznamchaId);
    // get old Stock value
    const oldQty = roznamcha.qty;
    // get old Customer Balance
    const oldCustomerAmount = roznamcha.amount;

    // update roznamcha entry with new updates
    roznamcha.entryType = entryType;
    roznamcha.customerType = customerType;
    roznamcha.paymentType = paymentType;
    roznamcha.truckNumber = truckNumber;
    roznamcha.qty = qty;
    roznamcha.amount = amount;
    roznamcha.location = location;
    roznamcha.sizeId = sizeId;
    roznamcha.patternId = patternId;
    roznamcha.customerId = customerId;
    roznamcha.bankAccountId = bankAccountId;
    roznamcha.cashCustomer = cashCustomer;

    // update roznamcha now
    await roznamcha.save();

    // update Bank Khata only while entryType is amount
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT &&
      bankAccountId
    ) {
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );
      const updateBankAccountBalance =
        Number(amount) - Number(oldCustomerAmount);
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) + updateBankAccountBalance;
      await UpdateBankAccountBalance.save();
    }

    // update Customer info only while sell stock or receive amount and only for non cash customers
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT ||
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
        customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH)
    ) {
      const UpdateCustomerBalance = await Customer.findByPk(customerId);
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
        const updateCustomerAmount =
          Number(amount) *
            (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty)) -
          Number(oldCustomerAmount) *
            (Number(oldQty) % 2 === 0 ? Number(oldQty) / 2 : Number(oldQty));
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - updateCustomerAmount;
      } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT) {
        const updateBalance = Number(amount) - Number(oldCustomerAmount);
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) + updateBalance;
      }
      await UpdateCustomerBalance.save();
    }

    // update stock while entry type is add stock and sell stock
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK ||
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
    ) {
      const updateStock = await Stock.findOne({
        where: { patternId: patternId, sizeId: sizeId },
      });
      // check if the stock is already exist then add to total stock or remove from stock
      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK) {
        const updateTotal = Number(qty) - Number(oldQty);
        updateStock.total = Number(updateStock.total) + updateTotal;
        await updateStock.save();
      } else if (
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
      ) {
        const updateTotal = Number(qty) - Number(oldQty);
        updateStock.total = Number(updateStock.total) - updateTotal;
        await updateStock.save();
      }
    }

    console.log("UPDATED Roznamcha!");
    res.redirect("/roznamcha");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteRoznamcha = async (req, res, next) => {
  const roznamchaId = req.body.roznamchaId;

  try {
    const roznamcha = await Roznamcha.findByPk(roznamchaId);

    const entryType = roznamcha.entryType;
    const bankAccountId = roznamcha.bankAccountId;
    const amount = roznamcha.amount;
    const customerId = roznamcha.customerId;
    const customerType = roznamcha.customerType;
    const qty = roznamcha.qty;
    const sizeId = roznamcha.sizeId;
    const patternId = roznamcha.patternId;

    // update Bank Khata only while entryType is amount
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT &&
      bankAccountId
    ) {
      const UpdateBankAccountBalance = await BankAccount.findByPk(
        bankAccountId
      );
      UpdateBankAccountBalance.balance =
        Number(UpdateBankAccountBalance.balance) - Number(amount);
      await UpdateBankAccountBalance.save();
    }

    // update Customer info only while sell stock or receive amount and only for non cash customers
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT ||
      (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
        customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH)
    ) {
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) +
          Number(amount) *
            (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty));
      } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.AMOUNT) {
        UpdateCustomerBalance.balance =
          Number(UpdateCustomerBalance.balance) - Number(amount);
      }
      await UpdateCustomerBalance.save();
    }

    // check if the stock is already exist then add to total stock or remove from stock
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK) {
      const updateStock = await Stock.findOne({
        where: { patternId: patternId, sizeId: sizeId },
      });
      updateStock.total = Number(updateStock.total) - Number(qty);
      await updateStock.save();
    } else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      const updateStock = await Stock.findOne({
        where: { patternId: patternId, sizeId: sizeId },
      });
      updateStock.total = Number(updateStock.total) + Number(qty);
      await updateStock.save();
    }

    await roznamcha.destroy();

    console.log("DESTROYED PRODUCT");
    res.redirect("/roznamcha");
  } catch {
    (reason) => console.log(reason);
  }
};
