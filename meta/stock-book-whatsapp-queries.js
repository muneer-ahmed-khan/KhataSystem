const moment = require("moment");
const Sequelize = require("sequelize");
const { StockBook, Customer, Size, Pattern } = require("../models");
const { CONSTANTS } = require("../config/constants");
const { createPDF } = require("../services/pdfFile");
const { thousandSeparator } = require("../helpers/helpers");

// handle all valid queries here
exports.generateStockBook = (query, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let stockBooks;
      console.log();
      // search stock book by different time date queries
      if (data && !data.data)
        stockBooks = await StockBook.findAll({
          where:
            query === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
              ? {
                  updatedAt: {
                    [Sequelize.Op.gt]: moment().startOf("day"), // today day start
                    [Sequelize.Op.lt]: moment()
                      .subtract(0, "days")
                      .endOf("day"), // up to now
                  },
                }
              : query === CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
              ? {
                  updatedAt: {
                    [Sequelize.Op.gt]: moment()
                      .subtract(1, "days")
                      .startOf("day"), // today day start
                    [Sequelize.Op.lt]: moment()
                      .subtract(1, "days")
                      .endOf("day"), // up to now
                  },
                }
              : query === CONSTANTS.ROZNAMCHA.QUERIES.WEEK
              ? {
                  updatedAt: {
                    [Sequelize.Op.gt]: moment()
                      .subtract(1, "week")
                      .startOf("day"), // today day start
                    [Sequelize.Op.lt]: moment()
                      .subtract(1, "days")
                      .endOf("day"), // up to now
                  },
                }
              : query === CONSTANTS.ROZNAMCHA.QUERIES.MONTH
              ? {
                  updatedAt: {
                    [Sequelize.Op.gt]: moment()
                      .subtract(1, "month")
                      .startOf("day"), // today day start
                    [Sequelize.Op.lt]: moment()
                      .subtract(1, "days")
                      .endOf("day"), // up to now
                  },
                }
              : query === CONSTANTS.ROZNAMCHA.QUERIES.TOTAL
              ? {}
              : {},
          include: [
            { model: Customer, as: "customer" },
            { model: Pattern, as: "pattern" },
            { model: Size, as: "size" },
          ],
          order: [["id", "DESC"]],
        });
      else stockBooks = data.data;
      // create pdf file table columns and data
      let stockBookData = [];
      stockBookData.push([
        { text: "#ID", style: "tableHeaderColumns" },
        { text: "Date", style: "tableHeaderColumns" },
        { text: "Qty", style: "tableHeaderColumns" },
        { text: "Pattern/Size", style: "tableHeaderColumnsLeft" },
        { text: "ET", style: "tableHeaderColumns" },
        { text: "Details", style: "tableHeaderColumns" },
        { text: "Cust / Truck #", style: "tableHeaderColumnsLeft" },
        { text: "Price", style: "tableHeaderColumns" },
        { text: "Total / Rent", style: "tableHeaderColumnsLeft" },
      ]);

      // check if we have records in stock book so far
      // console.log("check stock book length first ", stockBooks);
      if (stockBooks.length) {
        let fromDate, toDate;
        if (data && !data.data) {
          // Get From date
          toDate = new Date(
            Math.max(
              ...stockBooks.map((element) => {
                return new Date(element.updatedAt);
              })
            )
          );

          // Get To date
          fromDate = new Date(
            Math.min(
              ...stockBooks.map((element) => {
                return new Date(element.updatedAt);
              })
            )
          );
        } else {
          // Get From date
          toDate = data.toDate;

          // Get To date
          fromDate = data.fromDate;
        }

        let totalArrive = 0,
          totalSell = 0;

        stockBooks.map((ele) => {
          if (ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK)
            totalArrive += Number(ele.qty);
          else totalSell += Number(ele.qty);
        });

        for (let index = 0; index < stockBooks.length; index++) {
          stockBookData.push([
            { text: index + 1, style: "tableCell" },
            {
              text: new moment(stockBooks[index].updatedAt).format(
                "DD-MM-YYYY"
              ),
              style: "tableCell",
            },
            { text: stockBooks[index].qty, style: "tableCell" },
            {
              text:
                stockBooks[index].pattern.name +
                "/" +
                stockBooks[index].size.type,
              style: "tableCellLeft",
            },
            {
              text:
                stockBooks[index].entryType === "addStock" ? "Arrive" : "Sell",
              style:
                stockBooks[index].entryType === "addStock"
                  ? "tableCellArrive"
                  : "tableCell",
            },
            {
              text:
                stockBooks[index].customerType ===
                CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
                  ? "Khata"
                  : stockBooks[index].customerType ===
                    CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH
                  ? "Cash"
                  : stockBooks[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
                  ? "Truck"
                  : "-",
              style: "tableCell",
            },
            {
              text:
                stockBooks[index].entryType ===
                  CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
                stockBooks[index].customerType ===
                  CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
                  ? stockBooks[index].customer.name
                  : stockBooks[index].entryType ===
                      CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
                    stockBooks[index].customerType ===
                      CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH
                  ? stockBooks[index].cashCustomer
                  : stockBooks[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
                  ? stockBooks[index].truckNumber
                  : "-",
              style: "tableCellLeft",
            },
            {
              text:
                stockBooks[index].entryType ===
                CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
                  ? "-"
                  : thousandSeparator(stockBooks[index].amount),
              style: "tableCell",
            },
            {
              text:
                stockBooks[index].entryType ===
                CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
                  ? thousandSeparator(stockBooks[index].amount)
                  : thousandSeparator(
                      Number(stockBooks[index].amount) *
                        (Number(stockBooks[index].qty) % 2 === 0
                          ? Number(stockBooks[index].qty) / 2
                          : Number(stockBooks[index].qty))
                    ),
              style: "tableCellLeft",
            },
          ]);
        }
        // pdf make dd - document definition here
        var docDefinition = {
          pageSize: "A4", // pdf page size
          header: function (currentPage, pageCount, pageSize) {
            return [
              {
                table: {
                  widths: ["*"],
                  body: [
                    [
                      {
                        text: "Khata System APP",
                        fillColor: "#00695c",
                        color: "#FFFFFF",
                        bold: true,
                        characterSpacing: 2,
                        fontSize: 20,
                        alignment: "center",
                      },
                    ],
                  ],
                },
                layout: "headerLineOnly",
              },
              {
                text: [
                  { text: "Page:", style: { bold: true } },
                  {
                    text: `[${currentPage} of ${pageCount}]`,
                  },
                ],
                style: "pageCount",
              },
              {
                text: [
                  { text: "Stock Book", style: { bold: true } },
                  {
                    text: " Report",
                  },
                ],
                style: "pageTitle",
              },
              {
                layout: {
                  hLineWidth: function (i, node) {
                    return i === 0 || i === node.table.body.length ? 2 : 1;
                  },
                  vLineWidth: function (i, node) {
                    return i === 0 || i === node.table.widths.length ? 2 : 1;
                  },
                  hLineColor: function (i, node) {
                    return i !== 0 || i === node.table.body.length
                      ? "gray"
                      : "gray";
                  },
                  vLineColor: function (i, node) {
                    return i === 0 || i === node.table.widths.length
                      ? "white"
                      : "white";
                  },
                  // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                  // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                  // paddingLeft: function(i, node) { return 4; },
                  // paddingRight: function(i, node) { return 4; },
                  // paddingTop: function(i, node) { return 2; },
                  // paddingBottom: function(i, node) { return 2; },
                  // fillColor: function (rowIndex, node, columnIndex) { return null; }
                },
                style: "headerTableInfo",

                table: {
                  widths: ["*", "*"],
                  body: [
                    [
                      {
                        text: [
                          { text: "From Date: " },
                          {
                            text:
                              query === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
                                ? new moment().format("DD-MM-YYYY")
                                : query ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
                                ? new moment()
                                    .subtract(1, "days")
                                    .format("DD-MM-YYYY")
                                : query === CONSTANTS.ROZNAMCHA.QUERIES.WEEK
                                ? new moment()
                                    .subtract(1, "week")
                                    .format("DD-MM-YYYY")
                                : query === CONSTANTS.ROZNAMCHA.QUERIES.MONTH
                                ? new moment()
                                    .subtract(1, "month")
                                    .format("DD-MM-YYYY")
                                : new moment(fromDate).format("DD-MM-YYYY"),
                            style: {
                              bold: true,
                              italics: true,
                              decoration: "underline",
                              decorationStyle: "double",
                            },
                          },
                        ],
                      },
                      {
                        text: [
                          { text: "To Date: " },
                          {
                            text:
                              query !== CONSTANTS.ROZNAMCHA.QUERIES.TOTAL
                                ? new moment().format("DD-MM-YYYY")
                                : new moment(toDate).format("DD-MM-YYYY"),
                            style: {
                              bold: true,
                              italics: true,
                              decoration: "underline",
                              decorationStyle: "double",
                            },
                          },
                        ],
                      },
                    ],
                    [
                      {
                        text: [
                          { text: "Total" },
                          {
                            text: " Arrive: ",
                            style: {
                              color: "blue",
                            },
                          },
                          {
                            text: thousandSeparator(totalArrive),
                            style: {
                              bold: true,
                              italics: true,
                              decoration: "underline",
                              decorationStyle: "double",
                            },
                          },
                        ],
                      },
                      {
                        text: [
                          { text: "Total" },
                          {
                            text: " Sell: ",
                            style: {
                              color: "black",
                            },
                          },
                          {
                            text: thousandSeparator(totalSell),
                            style: {
                              bold: true,
                              italics: true,
                              decoration: "underline",
                              decorationStyle: "double",
                            },
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
            ];
          },
          // pdf content information after header
          content: [
            // insert the table that is created by query data
            {
              style: "tableExample",

              table: {
                headerRows: 1,
                widths: [
                  "auto",
                  "auto",
                  "auto",
                  90,
                  "auto",
                  "auto",
                  90,
                  "auto",
                  65,
                ],
                body: stockBookData,
              },
            },
            // print on pdf if there  is no data found for query
            {
              text: stockBookData.length === 0 ? "No Data yet" : "",
              style: "header",
            },
          ],

          // global styles to control pdf styles
          styles: {
            pageTitle: {
              fontSize: 15,
              margin: [50, 0, 0, 10],
              decoration: "underline",
            },
            pageCount: {
              fontSize: 9,
              alignment: "right",
              margin: [0, 10, 10, 0],
            },
            header: {
              fontSize: 14,
              margin: [0, 30, 0, 0],
            },
            headerTableInfoTitle: {
              fontSize: 10,
              margin: [50, 10, 0, 0],
            },
            headerTableInfo: {
              fontSize: 11,
              margin: [50, 0, 53, 0],
              alignment: "center",
            },
            tableExample: {
              alignment: "center",
            },
            tableHeaderColumns: {
              bold: true,
              fontSize: 11,
              alignment: "center",
              fillColor: "#e2e3e5",
            },
            tableHeaderColumnsLeft: {
              bold: true,
              fontSize: 11,
              alignment: "left",
              fillColor: "#e2e3e5",
            },
            tableCell: {
              alignment: "center",
              fontSize: 10,
            },
            tableCellArrive: {
              alignment: "center",
              fontSize: 10,
              color: "blue",
            },
            tableCellLeft: {
              alignment: "left",
              fontSize: 10,
            },
          },

          // setting for default styles
          defaultStyle: {
            // alignment: 'justify'
          },
          pageMargins: [50, 125, 50, 70],
        };
        // console.log(docDefinition);

        // generate pdf file now
        await createPDF(docDefinition, "stockBook");

        // pdf file should be ready by now
        resolve({
          data: true,
          message: "PDF file Generating wait for a sec.",
        });
      }
      // if there was no record found for query in stock book
      else {
        resolve({
          data: false,
          message: `No Data Found ${
            query
              ? "For " + query
              : "From " +
                moment(data.fromDate).format("DD-MM-YYYY") +
                " To " +
                moment(data.toDate).format("DD-MM-YYYY")
          }`,
        });
      }
    } catch (reason) {
      console.log("error in generating pdf doc ", reason);
      reject(reason);
    }
  });
};
