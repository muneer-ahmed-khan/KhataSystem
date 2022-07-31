// import models
const { Pattern } = require("../models");

// get all patterns
exports.getAllPattern = async (req, res, next) => {
  try {
    // get all patterns from db with ascending order of their names
    const patterns = await Pattern.findAll({ order: [["name", "ASC"]] });

    // render all patterns template with all patterns data
    res.render("pattern/pattern.ejs", {
      patterns: patterns,
      pageTitle: "All Patterns",
      path: "/pattern",
    });
  } catch (reason) {
    console.log("Error: in getAllPattern controller with reason --> ", reason);
  }
};

// add new pattern screen
exports.addPattern = (req, res, next) => {
  // render the new pattern template with editing = false
  res.render("pattern/edit-pattern", {
    pageTitle: "Add Pattern",
    path: "/pattern",
    editing: false,
  });
};

// add the new pattern to patterns list
exports.postAddPattern = async (req, res, next) => {
  // get the new patterns details from request params
  const name = req.body.name;

  try {
    // check if user has field the field with the data
    if (name)
      // create new pattern with new details
      await Pattern.create({
        name: name,
      });

    // render the all patterns with updated pattern as well
    console.log("Created Pattern");
    res.redirect("/pattern");
  } catch (reason) {
    console.log("Error: in postAddPattern controller with reason --> ", reason);
  }
};

// get edit pattern with editing mode = true
exports.getEditPattern = async (req, res, next) => {
  // get the editMode from request params
  const editMode = req.query.edit;

  // check if there is not editing mode then render all patterns screen instead
  if (!editMode) {
    return res.redirect("/pattern");
  }

  // get patternId from request params
  const patternId = req.params.patternId;

  try {
    // get pattern with the id from the db
    const pattern = await Pattern.findByPk(patternId);

    // if don't find pattern in db then render all patterns screen instead
    if (!pattern) {
      return res.redirect("/pattern");
    }

    // render edit pattern screen with pattern details available
    res.render("pattern/edit-pattern", {
      pageTitle: "Edit Pattern",
      path: "/pattern",
      editing: editMode,
      pattern: pattern,
    });
  } catch (reason) {
    console.log("Error: in getEditPattern controller with reason --> ", reason);
  }
};

// update the pattern info in db
exports.postEditPattern = async (req, res, next) => {
  // get patternId and pattern details from db
  const patternId = req.body.patternId;
  const updatedName = req.body.name;

  try {
    // find the pattern in db with patternId
    const pattern = await Pattern.findByPk(patternId);

    // update the pattern info in db
    pattern.name = updatedName;
    await pattern.save();

    // render the all pattern with the updated pattern as well
    console.log("UPDATED Pattern!");
    res.redirect("/pattern");
  } catch (reason) {
    console.log(
      "Error: in postEditPattern controller with reason --> ",
      reason
    );
  }
};

// delete pattern from db
exports.postDeletePattern = async (req, res, next) => {
  // get patternId from request params
  const patternId = req.body.patternId;

  try {
    // find the pattern in db
    const pattern = await Pattern.findByPk(patternId);

    // delete the pattern from db
    await pattern.destroy();

    // render the pattern screen
    console.log("DESTROYED PRODUCT");
    res.redirect("/pattern");
  } catch (reason) {
    console.log(
      "Error: in postDeletePattern controller with reason --> ",
      reason
    );
  }
};
