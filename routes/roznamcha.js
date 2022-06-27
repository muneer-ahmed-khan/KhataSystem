const express = require("express");

const roznamchaController = require("../controllers/roznamcha");

const router = express.Router();

// get all roznamchas
router.get("/roznamcha", roznamchaController.getRoznamcha);

// add roznamcha get and post route
router.get("/add-roznamcha", roznamchaController.addRoznamcha);
router.post("/add-roznamcha", roznamchaController.postAddRoznamcha);

// edit roznamcha get and post route
router.get(
  "/edit-roznamcha/:roznamchaId",
  roznamchaController.getEditRoznamcha
);
router.post("/edit-roznamcha", roznamchaController.postEditRoznamcha);

// delete roznamcha
router.post("/delete-roznamcha", roznamchaController.postDeleteRoznamcha);

module.exports = router;
