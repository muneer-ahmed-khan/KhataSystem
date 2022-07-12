const moment = require("moment");
const Roznamcha = require("../models/roznamcha");
const EntryType = require("../models/entry-type");
const BankAccount = require("../models/bank-account");
const Customer = require("../models/customer");

exports.createRoznamchaPDF = () => {
  return new Promise((resolve, reject) => {
    try {
      // Define font files
      var fonts = {
        Roboto: {
          normal: "fonts/Roboto-Regular.ttf",
          bold: "fonts/Roboto-Medium.ttf",
          italics: "fonts/Roboto-Italic.ttf",
          bolditalics: "fonts/Roboto-MediumItalic.ttf",
        },
      };

      var PdfPrinter = require("pdfmake");
      var printer = new PdfPrinter(fonts);
      var fs = require("fs");

      let roznamchaData = [];
      roznamchaData.push([
        { text: "#", style: "tableHeader" },
        { text: "Details", style: "tableHeader" },
        { text: "Amount", style: "tableHeader" },
      ]);
      Roznamcha.findAll({
        include: [EntryType, BankAccount, Customer],
        order: [["id", "DESC"]],
      }).then(async (roznamchas) => {
        for (let index = 0; index < roznamchas.length; index++) {
          roznamchaData.push([
            { text: index + 1, style: "tableCell" },
            {
              text: [
                {
                  text: `${roznamchas[index].customer.name}`,
                  style: "tableCell",
                },
                {
                  text: ` ${
                    roznamchas[index].entryType.type === "Credit"
                      ? roznamchas[index].entryType.type + " (+)"
                      : roznamchas[index].entryType.type + " (-)"
                  } `,
                  style: {
                    alignment: "center",
                    color:
                      roznamchas[index].entryType.type === "Credit"
                        ? "green"
                        : "red",
                  },
                },
                {
                  text: `${roznamchas[index].bankAccount.accountName}`,
                  style: "tableCell",
                },
              ],
            },
            { text: roznamchas[index].amount, style: "tableCell" },
          ]);
        }

        var docDefinition = {
          pageSize: "A4",
          header: [
            {
              table: {
                widths: ["*"],
                heights: 40,
                body: [
                  [
                    {
                      text: "Khata System APP",
                      fillColor: "#00695c",
                      color: "#FFFFFF",
                      bold: true,
                      characterSpacing: 4,
                      fontSize: 30,
                      alignment: "center",
                    },
                  ],
                ],
              },
              layout: "headerLineOnly",
            },
          ],

          content: [
            {
              columns: [
                {
                  text: [
                    { text: "Roznamcha", style: { bold: true } },
                    { text: " Today" },
                  ],
                  style: "header",
                },
                {
                  text: "Date: " + new moment().format("DD-MMM-YYYY"),
                  style: "subheader",
                },
              ],
            },
            {
              style: "tableExample",
              table: {
                widths: ["auto", 430, "auto"],
                body: roznamchaData,
              },
            },
          ],

          styles: {
            header: {
              fontSize: 24,
              margin: [0, 30, 0, 0],
            },
            subheader: {
              fontSize: 16,
              margin: [0, 40, 0, 0],
              alignment: "right",
            },
            tableExample: {
              margin: [0, 30, 0, 15],
            },
            tableHeader: {
              bold: true,
              fontSize: 14,
              color: "black",
              alignment: "center",
            },
            tableCell: {
              alignment: "center",
            },
          },
          defaultStyle: {
            // alignment: 'justify'
          },
        };

        var options = {
          // ...
        };
        var waitUntilPDFisReady;
        var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
        pdfDoc.pipe(
          (waitUntilPDFisReady = fs.createWriteStream(
            "./pdf/roznamcha_" + new moment().format("DD-MMM-YYYY") + ".pdf"
          ))
        );
        pdfDoc.end();
        waitUntilPDFisReady.on("finish", async function () {
          // pdf file should be ready by now
          resolve("done");
        });
      });
    } catch (reason) {
      reject(null);
      console.log("error in printing today roznamcha ");
    }
  });
};
