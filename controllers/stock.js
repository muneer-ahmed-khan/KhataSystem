const Stock = require("../models/stock");
const Size = require("../models/size");
const Pattern = require("../models/pattern");
const Roznamcha = require("../models/roznamcha");
const { CONSTANTS } = require("../config/constants");
const { Op } = require("sequelize");
const Customer = require("../models/customer");

exports.getStock = (req, res, next) => {
  Stock.findAll({ include: [Size, Pattern], order: [["id", "DESC"]] })
    .then((stocks) => {
      res.render("stock/stock.ejs", {
        stocks: stocks,
        pageTitle: "All stocks",
        path: "/stock",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addStock = async (req, res, next) => {
  const sizes = await Size.findAll();
  const patterns = await Pattern.findAll();

  res.render("stock/edit-stock", {
    pageTitle: "Add Stock",
    path: "/add-stock",
    editing: false,
    sizes: sizes,
    patterns: patterns,
  });
};

exports.postAddStock = (req, res, next) => {
  const size = req.body.size;
  const pattern = req.body.pattern;
  const total = req.body.name;
  Stock.create({
    total: total,
    sizeId: size,
    patternId: pattern,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created Stock");
      res.redirect("/stock");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditStock = async (req, res, next) => {
  const sizes = await Size.findAll();
  const patterns = await Pattern.findAll();
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/stock");
  }
  const stockId = req.params.stockId;

  Stock.findByPk(stockId)
    .then((stock) => {
      if (!stock) {
        return res.redirect("/stock");
      }
      res.render("stock/edit-stock", {
        pageTitle: "Edit Stock",
        path: "/edit-stock",
        editing: editMode,
        stock: stock,
        sizes: sizes,
        patterns: patterns,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditStock = (req, res, next) => {
  const updatedSize = req.body.size;
  const updatedPattern = req.body.pattern;
  const stockId = req.body.stockId;
  const updatedQty = req.body.name;
  Stock.findByPk(stockId)
    .then((stock) => {
      stock.total = updatedQty;
      stock.sizeId = updatedSize;
      stock.patternId = updatedPattern;
      return stock.save();
    })
    .then((result) => {
      console.log("UPDATED Stock!");
      res.redirect("/stock");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteStock = (req, res, next) => {
  const stockId = req.body.stockId;
  Stock.findByPk(stockId)
    .then((stock) => {
      return stock.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/stock");
    })
    .catch((err) => console.log(err));
};

exports.getStockDetails = (req, res, next) => {
  const stockId = req.params.stockId;
  Stock.findOne({ where: { id: stockId }, include: [Size, Pattern] })
    .then(async (stock) => {
      if (!stock) {
        return res.redirect("/stock");
      }
      const stockDetails = [];
      let stockTotal = 0;
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
