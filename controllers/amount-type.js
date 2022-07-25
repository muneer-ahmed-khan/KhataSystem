const AmountType = require("../models/amount-type");

exports.getAmountType = (req, res, next) => {
  AmountType.findAll({ order: [["id", "DESC"]] })
    .then((amount_types) => {
      res.render("amount-type/amount-type.ejs", {
        amount_types: amount_types,
        pageTitle: "All AmountTypes",
        path: "/amount-type",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addAmountType = (req, res, next) => {
  res.render("amount-type/edit-amount-type", {
    pageTitle: "Add AmountType",
    path: "/add-amount-type",
    editing: false,
  });
};

exports.postAddAmountType = (req, res, next) => {
  const type = req.body.name;
  AmountType.create({
    type: type,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created AmountType");
      res.redirect("/amount-type");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditAmountType = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/amount-type");
  }
  const amountTypeId = req.params.amountTypeId;
  console.log("check band id bro ", amountTypeId);
  AmountType.findByPk(amountTypeId)
    .then((amount_type) => {
      if (!amount_type) {
        return res.redirect("/amount-type");
      }
      res.render("amount-type/edit-amount-type", {
        pageTitle: "Edit AmountType",
        path: "/edit-amount-type",
        editing: editMode,
        amount_type: amount_type,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditAmountType = (req, res, next) => {
  const amountTypeId = req.body.amountTypeId;
  const updatedType = req.body.name;
  AmountType.findByPk(amountTypeId)
    .then((amount_type) => {
      amount_type.type = updatedType;
      return amount_type.save();
    })
    .then((result) => {
      console.log("UPDATED AmountType!");
      res.redirect("/amount-type");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteAmountType = (req, res, next) => {
  const amountTypeId = req.body.amountTypeId;
  AmountType.findByPk(amountTypeId)
    .then((amount_type) => {
      return amount_type.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/amount-type");
    })
    .catch((err) => console.log(err));
};
