const EntryType = require("../models/entry-type");

exports.getEntryType = (req, res, next) => {
  EntryType.findAll({ order: [["id", "DESC"]] })
    .then((entry_types) => {
      res.render("entry-type/entry-type.ejs", {
        entry_types: entry_types,
        pageTitle: "All EntryTypes",
        path: "/entry-type",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addEntryType = (req, res, next) => {
  res.render("entry-type/edit-entry-type", {
    pageTitle: "Add EntryType",
    path: "/add-entry-type",
    editing: false,
  });
};

exports.postAddEntryType = (req, res, next) => {
  const type = req.body.name;
  console.log("check request body ", req.body);
  EntryType.create({
    type: type,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created EntryType");
      res.redirect("/entry-type");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditEntryType = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/entry-type");
  }
  const entryTypeId = req.params.entryTypeId;
  console.log("check band id bro ", entryTypeId);
  EntryType.findByPk(entryTypeId)
    .then((entry_type) => {
      if (!entry_type) {
        return res.redirect("/entry-type");
      }
      res.render("entry-type/edit-entry-type", {
        pageTitle: "Edit EntryType",
        path: "/edit-entry-type",
        editing: editMode,
        entry_type: entry_type,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditEntryType = (req, res, next) => {
  const entryTypeId = req.body.entryTypeId;
  const updatedType = req.body.name;
  EntryType.findByPk(entryTypeId)
    .then((entry_type) => {
      entry_type.type = updatedType;
      return entry_type.save();
    })
    .then((result) => {
      console.log("UPDATED EntryType!");
      res.redirect("/entry-type");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteEntryType = (req, res, next) => {
  const entryTypeId = req.body.entryTypeId;
  EntryType.findByPk(entryTypeId)
    .then((entry_type) => {
      return entry_type.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/entry-type");
    })
    .catch((err) => console.log(err));
};
