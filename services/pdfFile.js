const moment = require("moment");
const Sequelize = require("sequelize");
const Roznamcha = require("../models/roznamcha");
const EntryType = require("../models/entry-type");
const BankAccount = require("../models/bank-account");
const Customer = require("../models/customer");

exports.createRoznamchaPDF = (query) => {
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
        where:
          query === "today"
            ? {
                createdAt: {
                  [Sequelize.Op.gt]: new Date().setHours(0, 0, 0, 0), // today day start
                  [Sequelize.Op.lt]: new Date(), // up to now
                },
              }
            : query === "yesterday"
            ? {
                createdAt: {
                  [Sequelize.Op.gt]: moment()
                    .subtract(2, "days")
                    .startOf("day"), // today day start
                  [Sequelize.Op.lt]: moment().subtract(1, "days").endOf("day"), // up to now
                },
              }
            : query === "week"
            ? {
                createdAt: {
                  [Sequelize.Op.gt]: moment()
                    .subtract(7, "days")
                    .startOf("day"), // today day start
                  [Sequelize.Op.lt]: moment().subtract(1, "days").endOf("day"), // up to now
                },
              }
            : query === "month"
            ? {
                createdAt: {
                  [Sequelize.Op.gt]: moment()
                    .subtract(30, "days")
                    .startOf("day"), // today day start
                  [Sequelize.Op.lt]: moment().subtract(1, "days").endOf("day"), // up to now
                },
              }
            : query === "total"
            ? {}
            : {},
        include: [EntryType, BankAccount, Customer],
        order: [["id", "DESC"]],
      }).then(async (roznamchas) => {
        // check if we have records in roznamcha so far
        console.log("check roznamcha length also ", roznamchas.length);
        if (roznamchas.length) {
          for (let index = 0; index < roznamchas.length; index++) {
            roznamchaData.push([
              { text: index + 1, style: "tableCell" },
              {
                text: [
                  {
                    text: `${roznamchas[index].customer.name}    `,
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
                    text: `    ${roznamchas[index].bankAccount.accountName}`,
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
                      {
                        text:
                          query === "today"
                            ? " Today"
                            : query === "yesterday"
                            ? " Yesterday"
                            : query === "week"
                            ? " Last Week"
                            : query === "month"
                            ? " Last Month"
                            : "",
                      },
                    ],
                    style: "header",
                  },
                  {
                    text:
                      query === "today"
                        ? "Date: " + new moment().format("DD-MMM-YYYY")
                        : query === "yesterday"
                        ? "Date: " +
                          new moment().subtract(1, "days").format("DD-MMM-YYYY")
                        : query === "week"
                        ? "From: " +
                          new moment()
                            .subtract(7, "days")
                            .format("DD-MMM-YYYY") +
                          " To: " +
                          new moment().subtract(1, "days").format("DD-MMM-YYYY")
                        : query === "month"
                        ? "From: " +
                          new moment()
                            .subtract(30, "days")
                            .format("DD-MMM-YYYY") +
                          " To: " +
                          new moment().subtract(1, "days").format("DD-MMM-YYYY")
                        : "",
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
              {
                text: roznamchaData.length === 0 ? "No Data yet" : "",
                style: "header",
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

          // delete irrelevant files from directory
          const fs = require("fs");
          const path = require("path");
          const directory = "./pdf/";

          fs.readdir(directory, (err, files) => {
            if (err) throw err;

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
          });

          // write a pdf document here
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
            resolve({
              data: true,
              message: "PDF file Generating with in just a while",
            });
          });
        } else {
          resolve({ data: false, message: "No Data Found for " + query });
        }
      });
    } catch (reason) {
      reject(reason);
      console.log("error in printing today roznamcha ");
    }
  });
};
