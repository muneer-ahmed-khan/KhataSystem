const express = require("express");

const patternController = require("../controllers/pattern");

const router = express.Router();

// get all pattern
router.get("/pattern", patternController.getPattern);

// add pattern get and post route
router.get("/add-pattern", patternController.addPattern);
router.post("/add-pattern", patternController.postAddPattern);

// edit pattern get and post route
router.get("/edit-pattern/:patternId", patternController.getEditPattern);
router.post("/edit-pattern", patternController.postEditPattern);

// delete pattern
router.post("/delete-pattern", patternController.postDeletePattern);

module.exports = router;
