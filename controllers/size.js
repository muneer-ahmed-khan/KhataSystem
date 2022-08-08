// import size model
const { Size } = require("../models");

// get all sizes
exports.getAllSizes = async (req, res, next) => {
  try {
    // get all sizes from db with descending order by type of size
    const sizes = await Size.findAll({ order: [["id", "DESC"]] });

    // render all size template and load all size data in it
    res.render("size/size", {
      sizes: sizes,
      pageTitle: "All Sizes",
      path: "/size",
    });
  } catch (reason) {
    console.log("Error: in getSize controller with reason --> ", reason);
  }
};

// render add new size template
exports.addSize = (req, res, next) => {
  // make editing false for new size template
  res.render("size/edit-size", {
    pageTitle: "Add Size",
    path: "/size",
    editing: false,
  });
};

// add new size to db
exports.postAddSize = async (req, res, next) => {
  // get new size type form request params
  const type = req.body.name;

  try {
    // check if user has field the field with the data
    if (type)
      // create new from param found in request
      await Size.create({
        type: type,
      });

    // render all size template with new size included
    console.log("Created Size");
    // res.redirect("/size");
    // handle ajax request response here it will redirect to main page
    res.send(req.protocol + "://" + req.get("host") + "/size");
  } catch (reason) {
    res.status(404).send("Error: in postAddSize controller with reason ");
    console.log("Error: in postAddSize controller with reason --> ", reason);
  }
};

// get edit size template
exports.getEditSize = async (req, res, next) => {
  // check for edit option from request params
  const editMode = req.query.edit;

  // if the edit mode was false then render back the all size template
  if (!editMode) {
    return res.redirect("/size");
  }

  // get size id from request params
  const sizeId = req.params.sizeId;

  //
  try {
    // find the size with id in db
    const size = await Size.findByPk(sizeId);

    // if the id was wrong or no data found then run all size template
    if (!size) {
      return res.redirect("/size");
    }

    // render the edit screen template with found size data
    res.render("size/edit-size", {
      pageTitle: "Edit Size",
      path: "/edit-size",
      editing: editMode,
      size: size,
    });
  } catch (reason) {
    console.log("Error: in getEditSize controller with reason --> ", reason);
  }
};

// save the edit size back to db
exports.postEditSize = async (req, res, next) => {
  // get sizeId and new size details from request params
  const sizeId = req.body.sizeId;
  const updatedType = req.body.name;

  try {
    // find the size with size id
    const size = await Size.findByPk(sizeId);

    // update the found size details and save back to db
    size.type = updatedType;
    await size.save();

    // run the all size template back with updated size
    console.log("UPDATED Size!");
    // res.redirect("/size");
    res.send(req.protocol + "://" + req.get("host") + "/size");
  } catch (reason) {
    res.status(404).send("Error: in postEditSize controller with reason ");
    console.log("Error: in postEditSize controller with reason --> ", reason);
  }
};

// delete the selected size
exports.postDeleteSize = async (req, res, next) => {
  // first find out the size id from request params
  const sizeId = req.body.sizeId;

  try {
    // find the size in db with size id
    const size = await Size.findByPk(sizeId);

    // delete the found size
    await size.destroy();

    // render all sizes template with deleted size
    console.log("DESTROYED PRODUCT");
    res.redirect("/size");
  } catch (error) {
    console.log("Error: in postDeleteSize controller with reason --> ", reason);
  }
};
