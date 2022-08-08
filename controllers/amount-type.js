// import import amount type model first
const { AmountType } = require("../models");

// render all amount types
exports.getAllAmountType = async (req, res, next) => {
  try {
    // get all amount types from db
    const amountTypes = await AmountType.findAll({ order: [["type", "ASC"]] });

    // render the all amount type screen
    res.render("amount-type/amount-type.ejs", {
      amount_types: amountTypes,
      pageTitle: "All AmountTypes",
      path: "/amount-type",
    });
  } catch (reason) {
    console.log(
      "Error: in getAllAmountType controller with reason --> ",
      reason
    );
  }
};

// add new amount type screen where editing = false
exports.addAmountType = (req, res, next) => {
  // render new amount type screen
  res.render("amount-type/edit-amount-type", {
    pageTitle: "Add AmountType",
    path: "/amount-type",
    editing: false,
  });
};

// add new amount type to db
exports.postAddAmountType = async (req, res, next) => {
  // get the new type details from request params
  const type = req.body.name;

  try {
    // check if user has the filled the field with the data
    if (type)
      // create new amount type
      await AmountType.create({
        type: type,
      });

    // render all types with new types
    console.log("Created AmountType");
    // res.redirect("/amount-type");
    // handle ajax request response here it will redirect to main page
    res.send(req.protocol + "://" + req.get("host") + "/amount-type");
  } catch (reason) {
    res.status(404).send("Error: in postAddAmountType controller with reason ");
    console.log(
      "Error: in postAddAmountType controller with reason --> ",
      reason
    );
  }
};

// get edit screen from existing amount type
exports.getEditAmountType = async (req, res, next) => {
  // check for edit mode in request params
  const editMode = req.query.edit;

  // if editMode = false then show all amount types
  if (!editMode) {
    return res.redirect("/amount-type");
  }

  // get amount type id from request params
  const amountTypeId = req.params.amountTypeId;

  try {
    // get amount type form db
    const amountType = await AmountType.findByPk(amountTypeId);

    // if amount types doesn't exist then do nothing
    if (!amountType) {
      return res.redirect("/amount-type");
    }

    // render edit mode from amount type
    res.render("amount-type/edit-amount-type", {
      pageTitle: "Edit AmountType",
      path: "/amount-type",
      editing: editMode,
      amount_type: amountType,
    });
  } catch (reason) {
    console.log(
      "Error: in getEditAmountType controller with reason --> ",
      reason
    );
  }
};

// update the amount type name in db
exports.postEditAmountType = async (req, res, next) => {
  // get the amount type id and amount type detail from request params
  const amountTypeId = req.body.amountTypeId;
  const updatedType = req.body.name;

  try {
    // find amount type with amount type id
    const amountType = await AmountType.findByPk(amountTypeId);

    // update amount type details in db
    amountType.type = updatedType;
    await amountType.save();

    // render all amount type template with updated one as well
    console.log("UPDATED AmountType!");
    // res.redirect("/amount-type");
    // handle ajax request response here it will redirect to main page
    res.send(req.protocol + "://" + req.get("host") + "/amount-type");
  } catch (reason) {
    res
      .status(404)
      .send("Error: in postEditAmountType controller with reason ");
    console.log(
      "Error: in postEditAmountType controller with reason --> ",
      reason
    );
  }
};

// delete amount type from db
exports.postDeleteAmountType = async (req, res, next) => {
  // get amount type id from request params
  const amountTypeId = req.body.amountTypeId;

  try {
    // find amount type in db
    const amountType = await AmountType.findByPk(amountTypeId);

    // delete the amountType from db
    await amountType.destroy();

    // render all amount types with updated data
    console.log("DESTROYED PRODUCT");
    res.redirect("/amount-type");
  } catch (reason) {
    console.log(
      "Error: in postDeleteAmountType controller with reason --> ",
      reason
    );
  }
};
