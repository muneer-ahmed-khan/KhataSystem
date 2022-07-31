// import express router
const express = require("express");
const router = express.Router();

// size controller
const sizeController = require("../controllers/size");

// get all size
router.get("/size", sizeController.getAllSizes);

// add size get and post route
router.get("/add-size", sizeController.addSize);
router.post("/add-size", sizeController.postAddSize);

// edit size get and post route
router.get("/edit-size/:sizeId", sizeController.getEditSize);
router.post("/edit-size", sizeController.postEditSize);

// delete size
router.post("/delete-size", sizeController.postDeleteSize);

module.exports = router;
