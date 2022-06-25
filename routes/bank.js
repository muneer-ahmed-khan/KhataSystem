// const path = require('path');

const express = require("express");

const bankController = require("../controllers/bank");

const router = express.Router();

// get all banks
router.get("/bank", bankController.getBanks);

// add bank get and post route
router.get("/add-bank", bankController.addBank);
router.post("/add-bank", bankController.postAddBank);

// edit bank get and post route
router.get("/edit-bank/:bankId", bankController.getEditBank);
router.post("/edit-bank", bankController.postEditBank);

// delete bank
router.post("/delete-bank", bankController.postDeleteBank);

module.exports = router;
