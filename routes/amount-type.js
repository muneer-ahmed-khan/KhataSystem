const express = require("express");

const amountTypeController = require("../controllers/amount-type");

const router = express.Router();

// get all amount-type
router.get("/amount-type", amountTypeController.getAmountType);

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
