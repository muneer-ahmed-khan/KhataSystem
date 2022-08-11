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

// a helper function to inject dynamic data into template strings
exports.template = (strings, ...keys) => {
  return (...values) => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join("");
  };
};
