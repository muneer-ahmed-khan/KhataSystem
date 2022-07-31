// import models and local files
const { Stock, Size, Pattern, Op } = require("../models");
const Roznamcha = require("../models/old models/roznamcha");
const Customer = require("../models/old models/customer");
const { CONSTANTS } = require("../config/constants");

// get all stock details
exports.getAllStock = async (req, res, next) => {
  try {
    // get all stock order by sizeId and patternId ascending order
    const stocks = await Stock.findAll({
      include: [
        { model: Size, as: "size" },
        { model: Pattern, as: "pattern" },
      ],
      order: [
        ["sizeId", "ASC"],
        ["patternId", "ASC"],
      ],
    });

    // render the all stock template
    res.render("stock/stock.ejs", {
      stocks: stocks,
      pageTitle: "All stocks",
      path: "/stock",
    });
  } catch (reason) {
    console.log("Error: in getAllStock controller with reason --> ", reason);
  }
};

// render new stock add template
exports.addStock = async (req, res, next) => {
  try {
    // get all related sizes and patterns
    const sizes = await Size.findAll();
    const patterns = await Pattern.findAll();

    // render the new stock template with data of sizes and patterns
    res.render("stock/edit-stock", {
      pageTitle: "Add Stock",
      path: "/stock",
      editing: false,
      sizes: sizes,
      patterns: patterns,
    });
  } catch (reason) {
    console.log("Error: in addStock controller with reason --> ", reason);
  }
};

// save the new stock details in db
exports.postAddStock = async (req, res, next) => {
  // get the new stock details from request params
  const size = req.body.size;
  const pattern = req.body.pattern;
  const startingStock = req.body.startingStock;

  try {
    // check if we have found all values for new stock
    if (size && pattern && startingStock)
      // create new stock with new stock details and total and starting stock the same
      await Stock.create({
        startingStock: startingStock,
        total: startingStock,
        sizeId: size,
        patternId: pattern,
      });

    // render the all stock template with stock details as well
    console.log("Created Stock");
    res.redirect("/stock");
  } catch (reason) {
    console.log("Error: in postAddStock controller with reason --> ", reason);
  }
};

// render edit stock template
exports.getEditStock = async (req, res, next) => {
  // get editMode value from request params
  const editMode = req.query.edit;

  // if editMode = false then do nothing
  if (!editMode) {
    return res.redirect("/stock");
  }

  try {
    // get the stock id from the request params
    const stockId = req.params.stockId;

    // get all the size and patterns data
    const allSizes = await Size.findAll();
    const allPatterns = await Pattern.findAll();

    // find the stock by the provided id
    const stock = await Stock.findByPk(stockId);

    // if we don't find any stock then  do nothing
    if (!stock) {
      return res.redirect("/stock");
    }

    // render the edit stock template with all stock details selected
    res.render("stock/edit-stock", {
      pageTitle: "Edit Stock",
      path: "/stock",
      editing: editMode,
      stock: stock,
      sizes: allSizes,
      patterns: allPatterns,
    });
  } catch (reason) {
    console.log("Error: in getEditStock controller with reason --> ", reason);
  }
};

// update the existing stock details
exports.postEditStock = async (req, res, next) => {
  // get all updated stock details from request params
  const updatedSize = req.body.size;
  const updatedPattern = req.body.pattern;
  const stockId = req.body.stockId;
  const updatedStartingStock = req.body.startingStock;
  const updatedTotal = req.body.totalStock;

  try {
    // find the stock in db
    const stock = await Stock.findByPk(stockId);

    // then update all the stock details
    stock.startingStock = updatedStartingStock;
    stock.total = updatedTotal;
    stock.sizeId = updatedSize;
    stock.patternId = updatedPattern;

    // now update the stock details in db
    await stock.save();

    // render the all stock template with new details as well
    console.log("UPDATED Stock!");
    res.redirect("/stock");
  } catch (reason) {
    console.log("Error: in postEditStock controller with reason --> ", reason);
  }
};

// delete a stock from db
exports.postDeleteStock = async (req, res, next) => {
  // get the stock id from request params
  const stockId = req.body.stockId;

  try {
    // find the stock in db with id of stock
    const stock = await Stock.findByPk(stockId);

    // delete the stock from the db
    await stock.destroy();

    // render the updated stock details
    console.log("DESTROYED PRODUCT");
    res.redirect("/stock");
  } catch (reason) {
    console.log(
      "Error: in postDeleteStock controller with reason --> ",
      reason
    );
  }
};

// need to add comments here as well
exports.getStockDetails = (req, res, next) => {
  const stockId = req.params.stockId;
  Stock.findOne({ where: { id: stockId }, include: [Size, Pattern] })
    .then(async (stock) => {
      if (!stock) {
        return res.redirect("/stock");
      }
      const stockDetails = [];
      let stockTotal = stock.startingStock;
      const RoznamchaDetails = await Roznamcha.findAll({
        where: {
          patternId: stock.patternId,
          sizeId: stock.sizeId,
          [Op.or]: [
            { entryType: CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK },
            { entryType: CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK },
          ],
        },
        include: [Pattern, Size, Customer],
        order: [["id", "ASC"]],
      });

      stockDetails.push({
        startingStock: stockTotal,
      });

      for (let [key, value] of RoznamchaDetails.entries()) {
        stockTotal =
          value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
            ? Number(stockTotal) + Number(value.qty)
            : value.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
            ? Number(stockTotal) - Number(value.qty)
            : Number(stockTotal);

        stockDetails.push({
          Date: value.updatedAt,
          entryType: value.entryType,
          pattern: value.pattern.name,
          size: value.size.type,
          truckNumber: value.truckNumber,
          customer:
            value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? value.customer
              : value.customer,
          customerType: value.customerType,
          cashCustomer: value.cashCustomer,
          credit:
            value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
              ? value.qty
              : 0,
          debit:
            value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? value.qty
              : 0,
          total: stockTotal,
        });
      }

      res.render("stock/stock-detail.ejs", {
        stockDetails: stockDetails,
        stock: stock,
        pageTitle: `${stock.pattern.name} ${stock.size.type} Khata`,
        path: "/stock",
      });
    })
    .catch((err) => console.log(err));
};
