// get express router first
const express = require("express");
const router = express.Router();

// import the controller for routes
const bankController = require("../controllers/bank");

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

// export router routes to be used in main file
module.exports = router;
