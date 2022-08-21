// import express router
const express = require("express");
const router = express.Router();

// import stock controller
const stockController = require("../controllers/stock");

// get all stock
router.get("/stock", stockController.getAllStock);

// get all stock book search by date
router.get("/search-stock", stockController.searchStock);
// post stock book search by date
router.post("/post-search-stock", stockController.PostSearchStock);

// add stock get and post route
router.get("/add-stock", stockController.addStock);
router.post("/add-stock", stockController.postAddStock);

// edit stock get and post route
router.get("/edit-stock/:stockId", stockController.getEditStock);
router.post("/edit-stock", stockController.postEditStock);

// delete stock
router.post("/delete-stock", stockController.postDeleteStock);

// get all stocks details
router.get("/stock/:stockId", stockController.getStockDetails);

module.exports = router;
