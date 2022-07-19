const moment = require("moment");
const Sequelize = require("sequelize");
const Roznamcha = require("../models/roznamcha");
const EntryType = require("../models/amount-type");
const BankAccount = require("../models/bank-account");
const Customer = require("../models/customer");
const { CONSTANTS } = require("../config/constants");
const { createPDF } = require("../services/pdfFile");

// handle all valid queries here
exports.findQuery = (query) => {
  return new Promise(async (resolve, reject) => {
    // search all roznamcha queries here
    Roznamcha.findAll({
      where:
        query === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
          ? {
              createdAt: {
                [Sequelize.Op.gt]: new Date().setHours(0, 0, 0, 0), // today day start
                [Sequelize.Op.lt]: new Date(), // up to now
              },
            }
          : query === CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
          ? {
              createdAt: {
                [Sequelize.Op.gt]: moment().subtract(2, "days").startOf("day"), // today day start
                [Sequelize.Op.lt]: moment().subtract(1, "days").endOf("day"), // up to now
              },
            }
          : query === CONSTANTS.ROZNAMCHA.QUERIES.WEEK
          ? {
              createdAt: {
                [Sequelize.Op.gt]: moment().subtract(7, "days").startOf("day"), // today day start
                [Sequelize.Op.lt]: moment().subtract(1, "days").endOf("day"), // up to now
              },
            }
          : query === CONSTANTS.ROZNAMCHA.QUERIES.MONTH
          ? {
              createdAt: {
                [Sequelize.Op.gt]: moment().subtract(30, "days").startOf("day"), // today day start
                [Sequelize.Op.lt]: moment().subtract(1, "days").endOf("day"), // up to now
              },
            }
          : query === CONSTANTS.ROZNAMCHA.QUERIES.TOTAL
          ? {}
          : {},
      include: [EntryType, BankAccount, Customer],
      order: [["id", "DESC"]],
    })
      .then(async (roznamchas) => {
        // create pdf file table columns and data
        let roznamchaData = [];
        roznamchaData.push([
          { text: "#", style: "tableHeader" },
          { text: "Details", style: "tableHeader" },
          { text: "Amount", style: "tableHeader" },
        ]);
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

          // pdf make dd - document definition here
          var docDefinition = {
            pageSize: "A4", // pdf page size
            header: [
              // pdf headers settings
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

            // pdf content information after header
            content: [
              // define table header with name and dates
              {
                columns: [
                  // header left side part
                  {
                    text: [
                      { text: "Roznamcha", style: { bold: true } },
                      {
                        text:
                          query === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
                            ? " Today"
                            : query === CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
                            ? " Yesterday"
                            : query === CONSTANTS.ROZNAMCHA.QUERIES.WEEK
                            ? " Last Week"
                            : query === CONSTANTS.ROZNAMCHA.QUERIES.MONTH
                            ? " Last Month"
                            : "",
                      },
                    ],
                    style: "header",
                  },
                  // header right side part
                  {
                    text:
                      query === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
                        ? "Date: " + new moment().format("DD-MMM-YYYY")
                        : query === CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
                        ? "Date: " +
                          new moment().subtract(1, "days").format("DD-MMM-YYYY")
                        : query === CONSTANTS.ROZNAMCHA.QUERIES.WEEK
                        ? "From: " +
                          new moment()
                            .subtract(7, "days")
                            .format("DD-MMM-YYYY") +
                          " To: " +
                          new moment().subtract(1, "days").format("DD-MMM-YYYY")
                        : query === CONSTANTS.ROZNAMCHA.QUERIES.MONTH
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
              // insert the table that is created by query data
              {
                style: "tableExample",
                table: {
                  widths: ["auto", 430, "auto"],
                  body: roznamchaData,
                },
              },
              // print on pdf if there  is no data found for query
              {
                text: roznamchaData.length === 0 ? "No Data yet" : "",
                style: "header",
              },
            ],

            // global styles to control pdf styles
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

            // setting for default styles
            defaultStyle: {
              // alignment: 'justify'
            },
          };

          // generate pdf file now
          await createPDF(docDefinition);

          // pdf file should be ready by now
          resolve({
            data: true,
            message: "PDF file Generating with in just a while",
          });
        } else {
          resolve({ data: false, message: "No Data Found for " + query });
        }
      })
      .catch((reason) => {
        console.log("error in generating pdf doc ");
        reject(reason);
      });
  });
};
