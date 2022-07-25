const express = require("express");

const stockController = require("../controllers/stock");

const router = express.Router();

// get all stock
router.get("/stock", stockController.getStock);

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
