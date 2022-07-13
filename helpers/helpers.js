// delete irrelevant files from directory
const fs = require("fs");
const path = require("path");
const moment = require("moment");

// clear current directory files
exports.clearDirectory = (directory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) throw reject(err);

      for (const file of files) {
        if (
          file.split(".")[1] === "pdf" &&
          file.split(".")[0] !==
            "roznamcha_" + new moment().format("DD-MMM-YYYY")
        ) {
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
          });
        }
      }
      resolve("done");
    });
  });
};
