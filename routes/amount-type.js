// import express router
const express = require("express");
const router = express.Router();

// import amount type controller
const amountTypeController = require("../controllers/amount-type");

// get all amount-type
router.get("/amount-type", amountTypeController.getAllAmountType);

// add amount-type get and post route
router.get("/add-amount-type", amountTypeController.addAmountType);
router.post("/add-amount-type", amountTypeController.postAddAmountType);

// edit amount-type get and post route
router.get(
  "/edit-amount-type/:amountTypeId",
  amountTypeController.getEditAmountType
);
router.post("/edit-amount-type", amountTypeController.postEditAmountType);

// delete amount-type
router.post("/delete-amount-type", amountTypeController.postDeleteAmountType);

module.exports = router;
