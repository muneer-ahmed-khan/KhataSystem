const express = require("express");

const entryTypeController = require("../controllers/entry-type");

const router = express.Router();

// get all entry-type
router.get("/entry-type", entryTypeController.getEntryType);

// add entry-type get and post route
router.get("/add-entry-type", entryTypeController.addEntryType);
router.post("/add-entry-type", entryTypeController.postAddEntryType);

// edit entry-type get and post route
router.get(
  "/edit-entry-type/:entryTypeId",
  entryTypeController.getEditEntryType
);
router.post("/edit-entry-type", entryTypeController.postEditEntryType);

// delete entry-type
router.post("/delete-entry-type", entryTypeController.postDeleteEntryType);

module.exports = router;
