// import models
const { Bank } = require("../models");

// get all banks and order by name in ascending order
exports.getBanks = async (req, res, next) => {
  try {
    const allBanks = await Bank.findAll({ order: [["name", "ASC"]] });

    // render bank.ejs template with all banks
    res.render("bank/bank.ejs", {
      banks: allBanks,
      pageTitle: "All Banks",
      path: "/bank",
    });
  } catch (reason) {
    console.log("Error: in getBanks controller with reason --> ", reason);
  }
};

// render add a new bank template
exports.addBank = (req, res, next) => {
  // rendering add new bank template with editMode = false
  res.render("bank/edit-bank", {
    pageTitle: "Add Bank",
    path: "/bank",
    editing: false,
  });
};

// save the new bank and render bank.ejs template
exports.postAddBank = async (req, res, next) => {
  // get new bank name from request
  const name = req.body.name;

  try {
    // check if user has field the field with the data
    if (name)
      // create new bank name parameter
      await Bank.create({
        name: name,
      });

    // render bank.ejs template with all banks after new bank is created
    console.log("Created Bank");
    res.redirect("/bank");
  } catch (reason) {
    console.log("Error: in postAddBank controller with reason --> ", reason);
  }
};

// get edit bank template with edit mode equal to true
exports.getEditBank = async (req, res, next) => {
  // get edit parameter from query params in request
  const editMode = req.query.edit;

  // if edit mode is false then run all banks template
  if (!editMode) {
    return res.redirect("/bank");
  }

  // get the edited bankId param from request
  const bankId = req.params.bankId;
  try {
    // query bank table for given bankId
    const bank = await Bank.findByPk(bankId);

    // if there is no bank data found for given id run all bank template
    if (!bank) {
      return res.redirect("/bank");
    }

    // render the edit bank template with found bank details
    res.render("bank/edit-bank", {
      pageTitle: "Edit Bank",
      path: "/bank",
      editing: editMode,
      bank: bank,
    });
  } catch (reason) {
    console.log("Error: in getEditBank controller with reason --> ", reason);
  }
};

// update the edited bank with new bank details
exports.postEditBank = async (req, res, next) => {
  // get the bankId and and edited details from request parameters
  const bankId = req.body.bankId;
  const updatedName = req.body.name;

  try {
    // first get the edited bank from db
    const bank = await Bank.findByPk(bankId);

    // update bank details and save details in db
    bank.name = updatedName;
    await bank.save();

    // after bank update run all bank template
    console.log("UPDATED Bank!");
    res.redirect("/bank");
  } catch (reason) {
    console.log("Error: in postEditBanks controller with reason --> ", reason);
  }
};

// post delete bank
exports.postDeleteBank = async (req, res, next) => {
  // get bankId from request params
  const bankId = req.body.bankId;

  try {
    // get bank detail for this id from db
    const bank = await Bank.findByPk(bankId);
    // delete found bank form db
    await bank.destroy();

    // render all banks template back after bank is deleted
    console.log("DESTROYED PRODUCT");
    res.redirect("/bank");
  } catch (error) {
    console.log("Error: in postDeleteBank controller with reason --> ", reason);
  }
};
