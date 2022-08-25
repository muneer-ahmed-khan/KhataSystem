const moment = require("moment");
const Sequelize = require("sequelize");
const { Stock, Size, Pattern, StockBook, Customer } = require("../models");
const { CONSTANTS } = require("../config/constants");
const { createPDF } = require("../services/pdfFile");
const { thousandSeparator } = require("../helpers/helpers");

exports.generateStockKhata = (stockId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let stock;
      console.log("check stockId ", stockId);
      // search stock book by different time date queries
      // find stock by in db
      stock = await Stock.findOne({
        where: { id: stockId },
        include: [
          { model: Size, as: "size" },
          { model: Pattern, as: "pattern" },
        ],
      });

      // if we don't find stock then do nothing in that case
      // if (!stock) {
      //   return res.redirect("/stock");
      // }

      // create all stock details from stock book
      const stockDetails = [];
      let stockTotal = stock.startingStock;

      // run get all stock book detail query
      const stockKhataDetails = await StockBook.findAll({
        where: {
          patternId: stock.patternId,
          sizeId: stock.sizeId,
          [Sequelize.Op.or]: [
            { entryType: CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK },
            { entryType: CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK },
          ],
        },
        include: [
          { model: Size, as: "size" },
          { model: Pattern, as: "pattern" },
          { model: Customer, as: "customer" },
        ],
        order: [["id", "ASC"]],
      });

      // add starting stock to first array
      stockDetails.push({
        startingStock: stockTotal,
      });

      // populate stock details from stock book details
      for (let [key, value] of stockKhataDetails.entries()) {
        stockTotal =
          value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
            ? Number(stockTotal) + Number(value.qty)
            : value.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
            ? Number(stockTotal) - Number(value.qty)
            : Number(stockTotal);

        // push details to stock details
        stockDetails.push({
          Date: value.updatedAt,
          entryType: value.entryType,
          pattern: value.pattern.name,
          size: value.size.type,
          truckNumber: value.truckNumber,
          customer:
            value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? value.customer
              : value.customer,
          customerType: value.customerType,
          cashCustomer: value.cashCustomer,
          credit:
            value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
              ? value.qty
              : 0,
          debit:
            value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? value.qty
              : 0,
          total: stockTotal,
        });
      }

      // create pdf file table columns and data
      let stockKhataInfo = [];
      stockKhataInfo.push([
        { text: "#ID", style: "tableHeaderColumns" },
        { text: "Date", style: "tableHeaderColumns" },
        { text: "Customer", style: "tableHeaderColumnsLeft" },
        { text: "Truck", style: "tableHeaderColumns" },
        { text: "Arrive", style: "tableHeaderColumnsLeft" },
        { text: "Sell", style: "tableHeaderColumnsLeft" },
        { text: "Total", style: "tableHeaderColumnsLeft" },
      ]);

      // check if we have records in stock book so far
      // console.log("check stock book length first ", stockDetails);
      if (stockDetails.length > 1) {
        let fromDate, toDate;
        // Get From date
        toDate = new Date(
          Math.max(
            ...stockDetails.map((element) => {
              return new Date(element.Date);
            })
          )
        );

        // Get To date
        fromDate = new Date(
          Math.min(
            ...stockDetails.map((element) => {
              if (element.Date) return new Date(element.Date);
              else return new Date();
            })
          )
        );

        let totalArrive = 0,
          totalSell = 0;

        stockDetails.map((ele) => {
          if (ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK)
            totalArrive += Number(ele.credit);
          else if (
            ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          )
            totalSell += Number(ele.debit);
        });

        for (let index = 0; index < stockDetails.length; index++) {
          if (index === 0) {
            stockKhataInfo.push([
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "Start", style: "tableHeaderColumnsRight" },
              {
                text: thousandSeparator(stockDetails[index].startingStock),
                style: "tableHeaderColumnsLeft",
              },
            ]);
          } else {
            stockKhataInfo.push([
              { text: index, style: "tableCell" },
              {
                text: new moment(stockDetails[index].Date).format("DD-MM-YYYY"),
                style: "tableCell",
              },
              {
                text:
                  stockDetails[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
                  stockDetails[index].customerType ===
                    CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
                    ? stockDetails[index].customer.name
                    : stockDetails[index].entryType ===
                        CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
                      stockDetails[index].customerType ===
                        CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.CASH
                    ? stockDetails[index].cashCustomer
                    : "-",
                style: "tableCellLeft",
              },
              {
                text:
                  stockDetails[index].entryType ===
                  CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.ADD_STOCK
                    ? `${stockDetails[index].truckNumber}`
                    : "-",
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(stockDetails[index].credit),
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(stockDetails[index].debit),
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(stockDetails[index].total),
                style: "tableCellLeft",
              },
            ]);
          }
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
                  {
                    text: `${stock.pattern.name} ${stock.size.type}`,
                    style: { bold: true },
                  },
                  {
                    text: " Khata Report",
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
                              stockId === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
                                ? new moment().format("DD-MM-YYYY")
                                : stockId ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
                                ? new moment()
                                    .subtract(1, "days")
                                    .format("DD-MM-YYYY")
                                : stockId === CONSTANTS.ROZNAMCHA.QUERIES.WEEK
                                ? new moment()
                                    .subtract(1, "week")
                                    .format("DD-MM-YYYY")
                                : stockId === CONSTANTS.ROZNAMCHA.QUERIES.MONTH
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
                              stockId !== CONSTANTS.ROZNAMCHA.QUERIES.TOTAL
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
            // insert the table that is created by stockId data
            {
              style: "tableExample",

              table: {
                headerRows: 1,
                widths: ["auto", 55, 130, 50, 60, 60, 60],
                body: stockKhataInfo,
              },
            },
            // print on pdf if there  is no data found for stockId
            {
              text: stockKhataInfo.length === 0 ? "No Data yet" : "",
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
              margin: [50, 0, 50, 0],
              alignment: "center",
            },
            tableExample: {
              alignment: "center",
            },
            tableHeaderColumns: {
              bold: true,
              fontSize: 9,
              alignment: "center",
              fillColor: "#e2e3e5",
            },
            tableHeaderColumnsLeft: {
              bold: true,
              fontSize: 9,
              alignment: "left",
              fillColor: "#e2e3e5",
            },
            tableHeaderColumnsRight: {
              bold: true,
              fontSize: 9,
              alignment: "right",
              fillColor: "#e2e3e5",
            },
            tableCell: {
              alignment: "center",
              fontSize: 9,
            },
            tableCellCredit: {
              alignment: "center",
              fontSize: 9,
              color: "green",
            },
            tableCellDebit: {
              alignment: "center",
              fontSize: 9,
              color: "red",
            },
            tableCellLeft: {
              alignment: "left",
              fontSize: 9,
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
      // if there was no record found for stockId in stock book
      else {
        resolve({
          data: false,
          message: `No Data Found`,
          // ${
          //   stockId
          //     ? "For " +
          //     : "From " +
          //       moment(data.fromDate).format("DD-MM-YYYY") +
          //       " To " +
          //       moment(data.toDate).format("DD-MM-YYYY")
          // }`,
        });
      }
    } catch (reason) {
      console.log("error in generating pdf doc ", reason);
      reject(reason);
    }
  });
};

exports.allStocks = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let allStocks = await Stock.findAll({
        include: [
          {
            model: Size,
            as: "size",
          },
          {
            model: Pattern,
            as: "pattern",
          },
        ],
        order: [
          ["sizeId", "ASC"],
          ["patternId", "ASC"],
        ],
      });
      let stocks = "";
      let type = null;
      let total = 0;
      let mainTotal = 0;
      for (const stock of allStocks) {
        if (stock.size.type !== type) {
          if (type !== null) {
            stocks += `     *Total*      ➡️  ${thousandSeparator(total)} \n`;
            total = 0;
          }
          stocks += `\n*_${stock.size.type}_*↴\n`;
          type = stock.size.type;
        }
        total += Number(stock.total);
        mainTotal += Number(stock.total);
        stocks += `     *${stock.pattern.name}*      ➡️  ${thousandSeparator(
          stock.total
        )} \n`;
      }
      stocks += `     *Total*      ➡️  ${thousandSeparator(total)} \n`;
      stocks += `\n*Total Stock*   ➡️  *${thousandSeparator(mainTotal)}* \n`;

      resolve(stocks);
    } catch (reason) {
      console.log("Error occur in ALL Stocks query for whatsapp");
      reject(reason);
    }
  });
};

exports.getStockForSearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stocks = await Stock.findAll({
        include: [
          {
            model: Size,
            as: "size",
          },
          {
            model: Pattern,
            as: "pattern",
          },
        ],
        order: [
          ["sizeId", "ASC"],
          ["patternId", "ASC"],
        ],
      });

      let allStocks = "Please send a *_number_* from below. \n\n";
      let type = null;
      let id = 0;
      for (const stock of stocks) {
        if (stock.size.type !== type) {
          allStocks += `\n*_${stock.size.type}_*↴\n`;
          type = stock.size.type;
        }
        id++;
        allStocks += `Press *_${id}_* ${id < 10 ? "  ➡️" : " ➡️"} *${
          stock.pattern.name
        }* Khata\n`;
      }
      allStocks += "\n" + CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU;
      resolve(allStocks);
    } catch (reason) {
      console.log("Error occur in getStockForSearch for whatsapp");
      reject(reason);
    }
  });
};

exports.findStock = (selectedOption) => {
  return new Promise(async (resolve, reject) => {
    try {
      const stocks = await Stock.findAll({
        include: [
          {
            model: Size,
            as: "size",
          },
          {
            model: Pattern,
            as: "pattern",
          },
        ],
        order: [
          ["sizeId", "ASC"],
          ["patternId", "ASC"],
        ],
      });

      let id = 1;
      let stockId = null;
      for (const stock of stocks) {
        if (id === +selectedOption) {
          stockId = stock.id;
        }
        id++;
      }
      resolve(stockId);
    } catch (reason) {
      console.log("Error occur in findStock for whatsapp");
      reject(reason);
    }
  });
};
