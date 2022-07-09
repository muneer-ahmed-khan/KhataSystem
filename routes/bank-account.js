const express = require("express");

const bankAccountController = require("../controllers/bank-account");

const router = express.Router();

// get all banks accounts
router.get("/bank-account", bankAccountController.getBankAccount);

// add bank-account get and post route
router.get("/add-bank-account", bankAccountController.addBankAccount);
router.post("/add-bank-account", bankAccountController.postAddBankAccount);

// edit bank-account get and post route
router.get(
  "/edit-bank-account/:bankAccountId",
  bankAccountController.getEditBankAccount
);
router.post("/edit-bank-account", bankAccountController.postEditBankAccount);

// delete bank-account
router.post(
  "/delete-bank-account",
  bankAccountController.postDeleteBankAccount
);

// get all banks account Khata
router.get(
  "/bank-account/khata/:bankAccountId",
  bankAccountController.getBankAccountKhata
);

module.exports = router;
