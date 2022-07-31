// import express router
const express = require("express");
const router = express.Router();

// import pattern controller
const patternController = require("../controllers/pattern");

// get all pattern
router.get("/pattern", patternController.getAllPattern);

// add pattern get and post route
router.get("/add-pattern", patternController.addPattern);
router.post("/add-pattern", patternController.postAddPattern);

// edit pattern get and post route
router.get("/edit-pattern/:patternId", patternController.getEditPattern);
router.post("/edit-pattern", patternController.postEditPattern);

// delete pattern
router.post("/delete-pattern", patternController.postDeletePattern);

module.exports = router;
