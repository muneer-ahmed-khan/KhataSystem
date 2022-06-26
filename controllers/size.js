const Size = require("../models/size");

exports.getSize = (req, res, next) => {
  Size.findAll({ order: [["id", "DESC"]] })
    .then((sizes) => {
      res.render("size/size.ejs", {
        sizes: sizes,
        pageTitle: "All Sizes",
        path: "/size",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addSize = (req, res, next) => {
  res.render("size/edit-size", {
    pageTitle: "Add Size",
    path: "/add-size",
    editing: false,
  });
};

exports.postAddSize = (req, res, next) => {
  const type = req.body.name;
  console.log("check request body ", req.body);
  Size.create({
    type: type,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created Size");
      res.redirect("/size");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditSize = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/size");
  }
  const sizeId = req.params.sizeId;
  console.log("check band id bro ", sizeId);
  Size.findByPk(sizeId)
    .then((size) => {
      if (!size) {
        return res.redirect("/size");
      }
      res.render("size/edit-size", {
        pageTitle: "Edit Size",
        path: "/edit-size",
        editing: editMode,
        size: size,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditSize = (req, res, next) => {
  const sizeId = req.body.sizeId;
  const updatedType = req.body.name;
  Size.findByPk(sizeId)
    .then((size) => {
      size.type = updatedType;
      return size.save();
    })
    .then((result) => {
      console.log("UPDATED Size!");
      res.redirect("/size");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteSize = (req, res, next) => {
  const sizeId = req.body.sizeId;
  Size.findByPk(sizeId)
    .then((size) => {
      return size.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/size");
    })
    .catch((err) => console.log(err));
};
