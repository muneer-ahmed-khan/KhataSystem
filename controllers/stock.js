// import models and local files
const {
  StockBook,
  Stock,
  Size,
  Pattern,
  Customer,
  Sequelize,
} = require("../models");
const { CONSTANTS } = require("../config/constants");
const { generateStockKhata } = require("../meta/stock-whatsapp-queries");
const { dateSearchResponse } = require("../services/whatsapp");

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

// get all customer search by date
exports.searchStock = async (req, res, next) => {
  try {
    let whatsapp = req.query.whatsapp;
    let user = req.query.user;

    // get all sizes from db
    const sizes = await Size.findAll({
      order: [["type", "ASC"]],
    });
    // get all patterns from db
    const patterns = await Pattern.findAll({
      order: [["name", "ASC"]],
    });

    // render the search by date stock book template
    res.render("stock/search-stock.ejs", {
      pageTitle: "Search Customer Khata",
      path: "/customer",
      sizes,
      patterns,
      whatsapp,
      user,
    });
  } catch (reason) {
    console.log("Error: in searchStock controller with reason --> ", reason);
  }
};

// get all stock book records search by date
exports.PostSearchStock = async (req, res, next) => {
  try {
    if (req && req.body) {
      // get req params to query stock book for
      // let fromDate = req.body.fromDate;
      // let toDate = req.body.toDate;
      let user = req.body.user;

      // find stock first
      let stock = await Stock.findOne({
        where: {
          sizeId: Number(req.body.sizeId),
          patternId: Number(req.body.patternId),
        },
      });

      if (stock) {
        // create pdf with generated query
        let response = await generateStockKhata(stock.id);

        console.log("check bro ", response);
        if (response.data) {
          dateSearchResponse(
            user,
            response.data,
            response.message,
            "stockBook"
          );
        } else {
          dateSearchResponse(
            user,
            response.data,
            response.message,
            "stockBook"
          );
        }
      } else {
        console.log("missing something in request body");
        dateSearchResponse(user, false, "No Data Found", "stockBook");
      }
    }

    res.sendStatus(200);

    // render the search by date stock book template
  } catch (reason) {
    console.log(
      "Error: in PostSearchCustomer controller with reason --> ",
      reason
    );
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
    // res.redirect("/stock");
    // handle ajax request response here it will redirect to main page
    res.send(req.protocol + "://" + req.get("host") + "/stock");
  } catch (reason) {
    res.status(404).send("Error: in postAddStock controller with reason ");
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
    // res.redirect("/stock");
    // handle ajax request response here it will redirect to main page
    res.send(req.protocol + "://" + req.get("host") + "/stock");
  } catch (reason) {
    res.status(404).send("Error: in postEditStock controller with reason ");
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

// get each stock details from stock book
exports.getStockDetails = async (req, res, next) => {
  // get stock id from request params
  const stockId = req.params.stockId;

  try {
    let stock;
    // check if we have patternId and stockId in request params then change query format
    if (Object.keys(req.query).length) {
      stock = await Stock.findOne({
        where: { patternId: req.query.patternId, sizeId: req.query.sizeId },
        include: [
          { model: Size, as: "size" },
          { model: Pattern, as: "pattern" },
        ],
      });
    }
    // find in stock in db by stockId
    else {
      stock = await Stock.findOne({
        where: { id: stockId },
        include: [
          { model: Size, as: "size" },
          { model: Pattern, as: "pattern" },
        ],
      });
    }

    // if stock was not found in db then do nothing
    if (!stock) {
      return res.redirect("/stock");
    }

    // create all stock details from stock book
    const stockDetails = [];
    let stockTotal = stock.startingStock;

    // run get all stock book detail query
    const StockBookDetail = await StockBook.findAll({
      where: {
        patternId: stock.patternId,
        sizeId: stock.sizeId,
        [Sequelize.Op.or]: [
          { entryType: CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK },
          { entryType: CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK },
        ],
      },
      include: [
        { model: Size, as: "size" },
        { model: Pattern, as: "pattern" },
        { model: Customer, as: "customer" },
      ],
      order: [["id", "ASC"]],
    });

    // add starting stock to first array
    stockDetails.push({
      startingStock: stockTotal,
    });

    // populate stock details from stock book details
    for (let [key, value] of StockBookDetail.entries()) {
      stockTotal =
        value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
          ? Number(stockTotal) + Number(value.qty)
          : value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          ? Number(stockTotal) - Number(value.qty)
          : Number(stockTotal);

      // push details to stock details
      stockDetails.push({
        Date: value.updatedAt,
        entryType: value.entryType,
        pattern: value.pattern.name,
        size: value.size.type,
        truckNumber: value.truckNumber,
        customer:
          value.customerType ===
          CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
            ? value.customer
            : value.cashCustomer,
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

    // render stock khata template
    res.render("stock/stock-detail.ejs", {
      stockDetails: stockDetails,
      stock: stock,
      pageTitle: `${stock.pattern.name} ${stock.size.type} Khata`,
      path: "/stock",
    });
  } catch (reason) {
    console.log(
      "Error: in getStockDetails controller with reason --> ",
      reason
    );
  }
};
