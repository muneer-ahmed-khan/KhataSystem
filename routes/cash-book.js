// import express router
const express = require("express");
const router = express.Router();

// import cash book controller
const cashBookController = require("../controllers/cash-book");

// get all cash book detail
router.get("/cash-book", cashBookController.getCashBook);

// get all stock book search by date
router.get("/search-cash-book", cashBookController.SearchCashBook);
// post stock book search by date
router.post("/post-search-cash-book", cashBookController.PostSearchCashBook);

// add cash book get and post route
router.get("/add-cash-book", cashBookController.addCashBook);
router.post("/add-cash-book", cashBookController.postAddCashBook);

// edit cash book get and post route
router.get("/edit-cash-book/:cashBookId", cashBookController.getEditCashBook);
router.post("/edit-cash-book", cashBookController.postEditCashBook);

// delete cash book
router.post("/delete-cash-book", cashBookController.postDeleteCashBook);

module.exports = router;
