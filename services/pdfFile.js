const moment = require("moment");
const PdfPrinter = require("pdfmake");
const fs = require("fs");
const { CONSTANTS } = require("../config/constants");
const { clearDirectory } = require("../helpers/helpers");

// Define font files for pdf files
const fonts = {
  Roboto: {
    normal: "fonts/Roboto-Regular.ttf",
    bold: "fonts/Roboto-Medium.ttf",
    italics: "fonts/Roboto-Italic.ttf",
    bolditalics: "fonts/Roboto-MediumItalic.ttf",
  },
};
// initialize pdf make constructor
const printer = new PdfPrinter(fonts);

// receive the document definition object for creating pdf file
exports.createPDF = (docDefinition) => {
  return new Promise(async (resolve, reject) => {
    try {
      let options = {
        // options to be included in pdf file
      };

      // first clear the pdf directory from old files
      let pdfDirectoryPath = "./pdf/";
      await clearDirectory(pdfDirectoryPath);

      // write a pdf document here
      let waitUntilPDFisReady;

      let pdfDoc = printer.createPdfKitDocument(docDefinition, options);
      pdfDoc.pipe(
        (waitUntilPDFisReady = fs.createWriteStream(
          `${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_PATH}${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        ))
      );
      pdfDoc.end();

      waitUntilPDFisReady.on("finish", function () {
        // pdf file should be ready by now
        resolve({
          done: true,
        });
      });
    } catch (reason) {
      reject(reason);
      console.log("error in generating pdf files ");
    }
  });
};
