// import models and local files
const {
  StockBook,
  AmountType,
  Customer,
  Pattern,
  Size,
  Stock,
  Sequelize,
} = require("../models");
const { CONSTANTS } = require("../config/constants");

// get all stock book records
exports.getStockBook = async (req, res, next) => {
  try {
    // get all stock book records from db
    let stockBooks = await StockBook.findAll({
      include: [
        { model: Customer, as: "customer" },
        { model: Pattern, as: "pattern" },
        { model: Size, as: "size" },
      ],
      order: [["id", "DESC"]],
    });

    // render all stock book template
    res.render("stock-book/stock-book.ejs", {
      stockBooks: stockBooks,
      pageTitle: "Stock Book",
      path: "/stock-book",
    });
  } catch (reason) {
    console.log("Error: in getStockBook controller with reason --> ", reason);
  }
};

// add new stock book record
exports.addStockBook = async (req, res, next) => {
  // get the type of entry from request params
  let entryType =
    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK in req.query
      ? CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
      : CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK;

  // declare global function variables
  let sizes,
    patterns,
    customers,
    customerTypes = null;

  try {
    // check the type of entry and process
    sizes = await Size.findAll({});
    patterns = await Pattern.findAll();

    // if we have sell stock then get only those sizes and pattern that are in stock
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      // we are selling tyres to those who khata have credit and debit both
      customers = await Customer.findAll({
        include: [
          {
            model: AmountType,
            as: "amountType",
            where: {
              type: {
                [Sequelize.Op.eq]: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
              },
            },
          },
        ],
        order: [["name", "ASC"]],
      });
      // get all possible types of customers
      customerTypes = StockBook.rawAttributes.customerType.values;
    }

    // render the add new stock book templates
    res.render("stock-book/edit-stock-book", {
      pageTitle: "Add new Stock Book",
      path: "/stock-book",
      editing: false,
      customers:
        entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          ? customers
          : [],
      customerTypes: customerTypes,
      patterns: patterns,
      sizes: sizes,
      entryType: entryType,
    });
  } catch (reason) {
    console.log("Error: in addStockBook controller with reason --> ", reason);
  }
};

// save new stock or new sell stock details
exports.postAddStockBook = async (req, res, next) => {
  // initialize global function variables
  let sizeId,
    patternId,
    qty,
    truckNumber,
    amount,
    customerType,
    cashCustomer,
    customerId = null;
  // get entryType from request params
  const entryType = req.body.entryType.trim();

  // get new data from request params
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

  try {
    // update stock while entry type is add stock and sell stock
    const [createOrUpdateStock, created] = await Stock.findOrCreate({
      where: { patternId: patternId, sizeId: sizeId },
      defaults: {
        patternId: patternId,
        sizeId: sizeId,
        startingStock: 0,
        total: qty,
      },
    });

    // check if the stock is already exist then add to total stock or remove from stock
    if (
      !created &&
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
    ) {
      // add new qty to current stock total
      createOrUpdateStock.total =
        Number(createOrUpdateStock.total) + Number(qty);
      // save new details in db
      await createOrUpdateStock.save();
    } else if (
      !created &&
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
    ) {
      // on sell stock entry remove qty of stock from total
      createOrUpdateStock.total =
        Number(createOrUpdateStock.total) - Number(qty);
      // save info in db
      await createOrUpdateStock.save();
    }

    // update Customer info only while sell stock
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
    ) {
      // find customer by id in db
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      // add the amount of new stock to customer over all balance
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) -
        Number(amount) *
          (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty));
      // save the info in db
      await UpdateCustomerBalance.save();
    }

    // save the new details to stock book in db
    await StockBook.create({
      entryType: entryType,
      customerType: customerType,
      truckNumber: truckNumber,
      qty: qty,
      amount: amount,
      sizeId: sizeId,
      patternId: patternId,
      customerId: customerId,
      cashCustomer: cashCustomer,
    });

    // render to stock book template on successful entry
    console.log("Created StockBook Entry Successfully");
    res.redirect("/stock-book");
  } catch (reason) {
    console.log(
      "Error: in postAddStockBook controller with reason --> ",
      reason
    );
  }
};

// get stock book edit page
exports.getEditStockBook = async (req, res, next) => {
  // check in request params for edit mode
  const editMode = req.query.edit;

  // if editMode is false then do nothing
  if (!editMode) {
    return res.redirect("/stock-book");
  }

  // get the entry type from request params
  const entryType = req.query.entryType.trim();

  // get stock book id from request params
  const stockBookId = req.params.stockBookId;

  // initialize function global function
  let sizes,
    patterns,
    customers,
    customerTypes = null;

  try {
    // get all sizes and patterns in case of add stock
    sizes = await Size.findAll();
    patterns = await Pattern.findAll();

    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      // if we have sell stock then get only those sizes and pattern that are in stock
      sizes = await Size.findAll({
        include: [
          {
            model: Stock,
            as: "stock",
            where: {
              sizeId: {
                [Sequelize.Op.ne]: null,
              },
            },
          },
        ],
      });

      patterns = await Pattern.findAll({
        include: [
          {
            model: Stock,
            as: "stock",
            where: {
              [Sequelize.Op.and]: [
                {
                  patternId: {
                    [Sequelize.Op.ne]: null,
                  },
                },
                {
                  total: {
                    [Sequelize.Op.gt]: 0,
                  },
                },
              ],
            },
          },
        ],
      });
      // we are selling tyres to those who khata have credit and debit both
      customers = await Customer.findAll({
        include: [
          {
            model: AmountType,
            as: "amountType",
            where: {
              type: {
                [Sequelize.Op.eq]: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
              },
            },
          },
        ],
        order: [["name", "ASC"]],
      });
      // get all possible values of customer types
      customerTypes = StockBook.rawAttributes.customerType.values;
    }

    // get stock book from db
    const stockBook = await StockBook.findByPk(stockBookId);

    // if we don't find stock book with given id then do nothing
    if (!stockBook) {
      return res.redirect("/stock-book");
    }

    // render edit stock template with pre populated data
    res.render("stock-book/edit-stock-book", {
      pageTitle: "Edit Stock Book",
      path: "/stock-book",
      editing: editMode,
      stockBook: stockBook,
      customers: customers,
      customerTypes: customerTypes,
      sizes: sizes,
      patterns: patterns,
      entryType: entryType,
    });
  } catch (reason) {
    console.log(
      "Error: in getEditStockBook controller with reason --> ",
      reason
    );
  }
};

// update existing stock book record data
exports.postEditStockBook = async (req, res, next) => {
  // initialize function global variables
  let sizeId,
    patternId,
    qty,
    truckNumber,
    amount,
    customerType,
    cashCustomer,
    customerId = null;

  // get entry type from request params
  const entryType = req.body.entryType.trim();

  // get updated data values from request params
  sizeId = req.body.size;
  patternId = req.body.pattern;
  qty = req.body.qty;
  amount = req.body.amount;

  // if we are updating add stock entry then get truck number in that case
  if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK)
    truckNumber = req.body.truckNumber;

  // if we are updating sell stock entry then get customerId customerType or cash customer
  if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
    customerId = req.body.customer ?? null;
    customerType = req.body.customerType;
    if (customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH)
      cashCustomer = req.body.cashCustomer;
  }

  try {
    // get stock book record id form request params
    const stockBookId = req.body.stockBookId;

    // get stock book record by id
    const stockBook = await StockBook.findByPk(stockBookId);

    // update Customer info only while sell stock non cash customers
    // if same khata customer was updated
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH &&
      customerType === stockBook.customerType &&
      customerId === stockBook.customerId
    ) {
      // update customer balance by finding first the customer by id
      const UpdateCustomerBalance = await Customer.findByPk(customerId);
      // calculate amount for customer
      const updateCustomerAmount =
        Number(amount) *
          (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty)) -
        Number(stockBook.amount) *
          (Number(stockBook.qty) % 2 === 0
            ? Number(stockBook.qty) / 2
            : Number(stockBook.qty));
      // now update customer balance with calculated value
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) - updateCustomerAmount;

      // update customer info in db
      await UpdateCustomerBalance.save();
    }
    // update Customer info only while sell stock non cash customers
    // if same khata customer was replaced by other existing khata customer
    else if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH &&
      customerType === stockBook.customerType &&
      customerId !== stockBook.customerId
    ) {
      // update old customer khata first
      const UpdateOldCustomerBalance = await Customer.findByPk(
        stockBook.customerId
      );
      UpdateOldCustomerBalance.balance =
        Number(UpdateOldCustomerBalance.balance) +
        Number(stockBook.amount) *
          (Number(stockBook.qty) % 2 === 0
            ? Number(stockBook.qty) / 2
            : Number(stockBook.qty));

      // update old customer balance
      await UpdateOldCustomerBalance.save();

      // update customer balance by finding first the customer by id
      const UpdateCustomerBalance = await Customer.findByPk(customerId);
      // calculate amount for customer
      const updateCustomerAmount =
        Number(amount) *
        (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty));
      // now update customer balance with calculated value
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) - updateCustomerAmount;

      // update customer info in db
      await UpdateCustomerBalance.save();
    }
    // this case is when someone edit customer Type and change from one type to other --> from Cash --> nonCash
    else if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH &&
      customerType !== stockBook.customerType
    ) {
      // find customer by id
      const UpdateCustomerBalance = await Customer.findByPk(customerId);

      console.log(
        "customer Type update------ cash to NonCash ",
        UpdateCustomerBalance.balance,
        Number(amount) * (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty))
      );
      // in this case we just need to debit amount to customers
      const updateCustomerAmount =
        Number(amount) *
        (Number(qty) % 2 === 0 ? Number(qty) / 2 : Number(qty));
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) - updateCustomerAmount;

      // update customer info in db
      await UpdateCustomerBalance.save();
    }
    // this case is when someone edit customer Type and change from one type to other --> from nonCash --> Cash
    else if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      customerType === CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH &&
      customerType !== stockBook.customerType
    ) {
      // first you need to find customer from which we will remove the amount
      const UpdateCustomerBalance = await Customer.findByPk(
        stockBook.customerId
      );
      console.log(
        "customer Type update------ nonCash to Cash ",
        UpdateCustomerBalance.balance,
        Number(stockBook.amount) *
          (Number(stockBook.qty) % 2 === 0
            ? Number(stockBook.qty) / 2
            : Number(stockBook.qty))
      );

      // add back the amount to nonCash customer because the amount is on cash customer
      const updateCustomerAmount =
        Number(stockBook.amount) *
        (Number(stockBook.qty) % 2 === 0
          ? Number(stockBook.qty) / 2
          : Number(stockBook.qty));

      // add the amount to customer balance
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) + updateCustomerAmount;

      // update user info in db
      await UpdateCustomerBalance.save();
    }

    // update stocks now
    // check if the stock is already exist then add to total stock or remove from stock
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK) {
      const [createOrUpdateStock, created] = await Stock.findOrCreate({
        where: { patternId: patternId, sizeId: sizeId },
        defaults: {
          patternId: patternId,
          sizeId: sizeId,
          startingStock: 0,
          total: qty,
        },
      });

      // if the stock was edited then run this case
      if (!created) {
        // check if the same stock was updated
        if (patternId == stockBook.patternId && sizeId == stockBook.sizeId) {
          const updateStock = Number(qty) - Number(stockBook.qty);
          // update the new stock total
          createOrUpdateStock.total =
            Number(createOrUpdateStock.total) + Number(updateStock);

          // update stock info in db
          await createOrUpdateStock.save();
        }
        // if any other existing stock was updated
        else {
          // first find the old stock by unique pattern and size
          const updateStock = await Stock.findOne({
            where: { patternId: stockBook.patternId, sizeId: stockBook.sizeId },
          });
          // update stock total
          updateStock.total = Number(updateStock.total) - Number(stockBook.qty);

          // save detail in db
          await updateStock.save();

          // update the new stock total
          createOrUpdateStock.total =
            Number(createOrUpdateStock.total) + Number(qty);

          // update stock info in db
          await createOrUpdateStock.save();
        }
      }
      // if the stock was replace by other pattern or size then update this back to old values
      else if (created) {
        // first find the old stock by unique pattern and size
        const updateStock = await Stock.findOne({
          where: { patternId: stockBook.patternId, sizeId: stockBook.sizeId },
        });
        // update stock total
        updateStock.total = Number(updateStock.total) - Number(stockBook.qty);

        // save detail in db
        await updateStock.save();
      }
    }

    // check if entry type is sell stock
    else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      // check if the same stock was updated
      if (patternId == stockBook.patternId && sizeId == stockBook.sizeId) {
        // find the stock first
        const updateSameStock = await Stock.findOne({
          where: { patternId: stockBook.patternId, sizeId: stockBook.sizeId },
        });
        const updateStock = Number(qty) - Number(stockBook.qty);
        // update the new stock total
        updateSameStock.total =
          Number(updateSameStock.total) - Number(updateStock);

        // update stock info in db
        await updateSameStock.save();
      }
      // if any other existing stock was updated
      else {
        // first find the old stock by unique pattern and size
        const updateStock = await Stock.findOne({
          where: { patternId: stockBook.patternId, sizeId: stockBook.sizeId },
        });
        // update stock total
        updateStock.total = Number(updateStock.total) + Number(stockBook.qty);

        // save detail in db
        await updateStock.save();

        // find stock by unique pattern and size
        const updateOtherExistingStock = await Stock.findOne({
          where: { patternId: patternId, sizeId: sizeId },
        });

        // update the new stock total
        updateOtherExistingStock.total =
          Number(updateOtherExistingStock.total) - Number(qty);

        // update stock info in db
        await updateOtherExistingStock.save();
      }
    }

    // update stockBook entry with new updates
    stockBook.entryType = entryType;
    stockBook.customerType = customerType;
    stockBook.truckNumber = truckNumber;
    stockBook.qty = qty;
    stockBook.amount = amount;
    stockBook.sizeId = sizeId;
    stockBook.patternId = patternId;
    stockBook.customerId = customerId;
    stockBook.cashCustomer = cashCustomer;

    // update stockBook now
    await stockBook.save();

    // render main stock book page
    console.log("UPDATED StockBook!");
    res.redirect("/stock-book");
  } catch (reason) {
    console.log(
      "Error: in postEditStockBook controller with reason --> ",
      reason
    );
  }
};

// delete the record from stock book
exports.postDeleteStockBook = async (req, res, next) => {
  // get entryType stockBookId from request params
  const entryType = req.body.entryType;
  const stockBookId = req.body.stockBookId;

  try {
    // get stock book with id from db
    const stockBook = await StockBook.findByPk(stockBookId);

    // update Customer info only while sell stock for non cash customers
    if (
      entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
      stockBook.customerType ===
        CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
    ) {
      // first get customer from db
      const UpdateCustomerBalance = await Customer.findByPk(
        stockBook.customerId
      );
      // update customer balance and add back the balance to customer balance
      UpdateCustomerBalance.balance =
        Number(UpdateCustomerBalance.balance) +
        Number(stockBook.amount) *
          (Number(stockBook.qty) % 2 === 0
            ? Number(stockBook.qty) / 2
            : Number(stockBook.qty));

      // update the customer updated info in db
      await UpdateCustomerBalance.save();
    }

    // check if the stock is already exist then add to total stock or remove from stock
    if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK) {
      // find stock by unique patternId and sizeId
      let updateStock = await Stock.findOne({
        where: { patternId: stockBook.patternId, sizeId: stockBook.sizeId },
      });
      // remove back the added stock from stock
      updateStock.total = Number(updateStock.total) - Number(stockBook.qty);

      // update the stock info in db
      await updateStock.save();
    }
    // update stock if that was sold and now deleted add back the stock
    else if (entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK) {
      // find stock by unique patternId and sizeId
      let updateStock = await Stock.findOne({
        where: { patternId: stockBook.patternId, sizeId: stockBook.sizeId },
      });
      // add back to stock the sold stock
      updateStock.total = Number(updateStock.total) + Number(stockBook.qty);
      await updateStock.save();
    }

    // delete the stock book record now
    await stockBook.destroy();

    // render back the stock book template
    console.log("DESTROYED StockBook Entry");
    res.redirect("/stock-book");
  } catch (reason) {
    console.log(
      "Error: in postDeleteStockBook controller with reason --> ",
      reason
    );
  }
};
