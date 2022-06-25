const Bank = require("../models/bank");

exports.getBanks = (req, res, next) => {
  Bank.findAll({ order: [["id", "DESC"]] })
    .then((banks) => {
      res.render("bank/bank.ejs", {
        banks: banks,
        pageTitle: "All Banks",
        path: "/bank",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addBank = (req, res, next) => {
  res.render("bank/edit-bank", {
    pageTitle: "Add Bank",
    path: "/add-bank",
    editing: false,
  });
};

exports.postAddBank = (req, res, next) => {
  const name = req.body.name;
  console.log("check request body ", req.body);
  Bank.create({
    name: name,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created Bank");
      res.redirect("/bank");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditBank = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/bank");
  }
  const bankId = req.params.bankId;
  console.log("check band id bro ", bankId);
  Bank.findByPk(bankId)
    .then((bank) => {
      if (!bank) {
        return res.redirect("/bank");
      }
      res.render("bank/edit-bank", {
        pageTitle: "Edit Bank",
        path: "/edit-bank",
        editing: editMode,
        bank: bank,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditBank = (req, res, next) => {
  const bankId = req.body.bankId;
  const updatedName = req.body.name;
  Bank.findByPk(bankId)
    .then((bank) => {
      bank.name = updatedName;
      return bank.save();
    })
    .then((result) => {
      console.log("UPDATED Bank!");
      res.redirect("/bank");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteBank = (req, res, next) => {
  const bankId = req.body.bankId;
  Bank.findByPk(bankId)
    .then((bank) => {
      return bank.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/bank");
    })
    .catch((err) => console.log(err));
};
