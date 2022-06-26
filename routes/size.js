const express = require("express");

const sizeController = require("../controllers/size");

const router = express.Router();

// get all size
router.get("/size", sizeController.getSize);

// add size get and post route
router.get("/add-size", sizeController.addSize);
router.post("/add-size", sizeController.postAddSize);

// edit size get and post route
router.get("/edit-size/:sizeId", sizeController.getEditSize);
router.post("/edit-size", sizeController.postEditSize);

// delete size
router.post("/delete-size", sizeController.postDeleteSize);

module.exports = router;
