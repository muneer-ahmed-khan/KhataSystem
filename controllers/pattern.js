const Pattern = require("../models/pattern");

exports.getPattern = (req, res, next) => {
  Pattern.findAll({ order: [["id", "DESC"]] })
    .then((patterns) => {
      res.render("pattern/pattern.ejs", {
        patterns: patterns,
        pageTitle: "All Patterns",
        path: "/pattern",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addPattern = (req, res, next) => {
  res.render("pattern/edit-pattern", {
    pageTitle: "Add Pattern",
    path: "/add-pattern",
    editing: false,
  });
};

exports.postAddPattern = (req, res, next) => {
  const name = req.body.name;
  Pattern.create({
    name: name,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created Pattern");
      res.redirect("/pattern");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditPattern = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/pattern");
  }
  const patternId = req.params.patternId;
  console.log("check band id bro ", patternId);
  Pattern.findByPk(patternId)
    .then((pattern) => {
      if (!pattern) {
        return res.redirect("/pattern");
      }
      res.render("pattern/edit-pattern", {
        pageTitle: "Edit Pattern",
        path: "/edit-pattern",
        editing: editMode,
        pattern: pattern,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditPattern = (req, res, next) => {
  const patternId = req.body.patternId;
  const updatedName = req.body.name;
  Pattern.findByPk(patternId)
    .then((pattern) => {
      pattern.name = updatedName;
      return pattern.save();
    })
    .then((result) => {
      console.log("UPDATED Pattern!");
      res.redirect("/pattern");
    })
    .catch((err) => console.log(err));
};

exports.postDeletePattern = (req, res, next) => {
  const patternId = req.body.patternId;
  Pattern.findByPk(patternId)
    .then((pattern) => {
      return pattern.destroy();
    })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/pattern");
    })
    .catch((err) => console.log(err));
};
