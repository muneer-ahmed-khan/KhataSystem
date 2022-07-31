// import express router
const express = require("express");
const router = express.Router();

// import customer controller
const customerController = require("../controllers/customer");

// get all customers
router.get("/customer", customerController.getAllCustomers);

// add customer get and post route
router.get("/add-customer", customerController.addCustomer);
router.post("/add-customer", customerController.postAddCustomer);

// edit customer get and post route
router.get("/edit-customer/:customerId", customerController.getEditCustomer);
router.post("/edit-customer", customerController.postEditCustomer);

// delete customer
router.post("/delete-customer", customerController.postDeleteCustomer);

// get all customer Khata
router.get("/customer/khata/:customerId", customerController.getCustomersKhata);

module.exports = router;
