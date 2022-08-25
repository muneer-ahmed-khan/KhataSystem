const moment = require("moment");
const {
  Customer,
  AmountType,
  Size,
  Pattern,
  BankAccount,
} = require("../models");
const { CONSTANTS } = require("../config/constants");
const { createPDF } = require("../services/pdfFile");
const { thousandSeparator } = require("../helpers/helpers");

// // handle all valid queries here
exports.generateCustomerKhata = (customerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let customer;
      console.log("check customerId ", customerId);
      // search stock book by different time date queries
      // find customer by in db
      customer = await Customer.findByPk(customerId);
      // if we don't find customer then do nothing in that case
      // if (!customer) {
      //   return res.redirect("/customer");
      // }

      // create customer information array first
      const customerDetails = [];

      // initiate customer balance from customer starting balance
      let customerBalance = customer.startingBalance;

      // add starting stock to first array
      customerDetails.push({
        startingBalance: customerBalance,
      });

      // get customer stock buy details
      const stockBookDetails = await customer.getStockBook({
        include: [
          { model: Size, as: "size" },
          { model: Pattern, as: "pattern" },
        ],
        order: [["id", "ASC"]],
      });

      // get customer credit and debit details
      const cashBookDetails = await customer.getCashBook({
        include: [{ model: BankAccount, as: "bankAccount" }],
      });

      // arrange stock details first
      for (let i of stockBookDetails) {
        customerDetails.push({
          Date: i.updatedAt,
          entryType: i.entryType,
          qty: i.qty,
          customerType: i.customerType,
          pattern:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? i.pattern.name
              : i.pattern,
          size:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? i.size.type
              : i.size,
          credit:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
              ? i.amount
              : 0,
          debit:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
              ? i.amount
              : i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
              ? Number(i.amount) * (i.qty % 2 === 0 ? i.qty / 2 : i.qty)
              : 0,
          amount: i.amount,
        });
      }
      // need to use while loop then
      // now arrange cash book details
      for (let i of cashBookDetails) {
        customerDetails.push({
          Date: i.updatedAt,
          entryType: i.entryType,
          paymentType: i.paymentType,
          customerType: i.customerType,
          bankDetails:
            (i.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
              i.entryType ===
                CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
            i.paymentType !== CONSTANTS.DATABASE_FIELDS.PAYMENT_TYPE.CASH
              ? i.bankAccount.accountName
              : i.bankAccount,
          credit:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
              ? i.amount
              : 0,
          debit:
            i.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
              ? i.amount
              : 0,
          amount: i.amount,
        });
      }

      // sort data
      customerDetails.sort(function (a, b) {
        return new Date(a.Date) - new Date(b.Date);
      });

      // add total to each row now
      customerDetails.map((item) => {
        if (!item.startingBalance) {
          customerBalance =
            item.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK &&
            item.customerType ===
              CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
              ? Number(customerBalance) -
                Number(item.amount) *
                  (item.qty % 2 === 0 ? item.qty / 2 : item.qty)
              : (item.entryType ===
                  CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
                  item.entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT) &&
                item.customerType ===
                  CONSTANTS.DATABASE_FIELDS.CUSTOMER_TYPE.NON_CASH
              ? Number(customerBalance) + Number(item.amount)
              : 0;

          item.balance = customerBalance;
        }
      });

      // create pdf file table columns and data
      let customerKhataDetails = [];
      customerKhataDetails.push([
        { text: "#ID", style: "tableHeaderColumns" },
        { text: "Date", style: "tableHeaderColumns" },
        { text: "QTY", style: "tableHeaderColumns" },
        { text: "Pattern/Size", style: "tableHeaderColumnsLeft" },
        { text: "Price", style: "tableHeaderColumns" },
        { text: "Pay Type", style: "tableHeaderColumns" },
        { text: "Bank Account", style: "tableHeaderColumnsLeft" },
        { text: "Credit +", style: "tableHeaderColumnsLeft" },
        { text: "Debit -", style: "tableHeaderColumnsLeft" },
        { text: "Balance", style: "tableHeaderColumnsLeft" },
      ]);

      // check if we have records in stock book so far
      // console.log("check stock book length first ", customerDetails);
      if (customerDetails.length > 1) {
        let fromDate, toDate;
        // Get From date
        toDate = new Date(
          Math.max(
            ...customerDetails.map((element) => {
              return new Date(element.Date);
            })
          )
        );

        // Get To date
        fromDate = new Date(
          Math.min(
            ...customerDetails.map((element) => {
              if (element.Date) return new Date(element.Date);
              else return new Date();
            })
          )
        );

        let totalCredit = 0,
          totalDebit = 0;

        customerDetails.map((ele) => {
          if (
            ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
          )
            totalCredit += Number(ele.credit);
          else if (
            ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
          )
            totalDebit += Number(ele.debit);
        });

        for (let index = 0; index < customerDetails.length; index++) {
          if (index === 0) {
            customerKhataDetails.push([
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "Start", style: "tableHeaderColumnsRight" },
              {
                text: thousandSeparator(customerDetails[index].startingBalance),
                style: "tableHeaderColumnsLeft",
              },
            ]);
          } else {
            customerKhataDetails.push([
              { text: index, style: "tableCell" },
              {
                text: new moment(customerDetails[index].Date).format(
                  "DD-MM-YYYY"
                ),
                style: "tableCell",
              },
              {
                text:
                  customerDetails[index].entryType ===
                  CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
                    ? customerDetails[index].qty
                    : "-",
                style: "tableCell",
              },
              {
                text:
                  customerDetails[index].entryType ===
                  CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
                    ? `${customerDetails[index].size} ${customerDetails[index].pattern}`
                    : "-",
                style: "tableCellLeft",
              },
              {
                text:
                  customerDetails[index].entryType ===
                  CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.SELL_STOCK
                    ? `${customerDetails[index].amount}`
                    : "-",
                style: "tableCellLeft",
              },
              {
                text:
                  customerDetails[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
                  customerDetails[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
                    ? `${customerDetails[index].paymentType.toUpperCase()}`
                    : "-",
                style: "tableCell",
              },
              {
                text:
                  customerDetails[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT ||
                  customerDetails[index].entryType ===
                    CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
                    ? `${customerDetails[index].bankDetails}`
                    : "-",
                style: "tableCell",
              },
              {
                text: thousandSeparator(customerDetails[index].credit),
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(customerDetails[index].debit),
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(customerDetails[index].balance),
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
                  { text: `${customer.name}`, style: { bold: true } },
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
                              customerId === CONSTANTS.ROZNAMCHA.QUERIES.TODAY
                                ? new moment().format("DD-MM-YYYY")
                                : customerId ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
                                ? new moment()
                                    .subtract(1, "days")
                                    .format("DD-MM-YYYY")
                                : customerId ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.WEEK
                                ? new moment()
                                    .subtract(1, "week")
                                    .format("DD-MM-YYYY")
                                : customerId ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.MONTH
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
                              customerId !== CONSTANTS.ROZNAMCHA.QUERIES.TOTAL
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
                            text: " Credit: ",
                            style: {
                              color: "green",
                            },
                          },
                          {
                            text: thousandSeparator(totalCredit),
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
                            text: " Debit: ",
                            style: {
                              color: "red",
                            },
                          },
                          {
                            text: thousandSeparator(totalDebit),
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
            // insert the table that is created by customerId data
            {
              style: "tableExample",

              table: {
                headerRows: 1,
                widths: [
                  "auto",
                  "auto",
                  "auto",
                  76,
                  40,
                  "auto",
                  76,
                  50,
                  50,
                  54,
                ],
                body: customerKhataDetails,
              },
            },
            // print on pdf if there  is no data found for customerId
            {
              text: customerKhataDetails.length === 0 ? "No Data yet" : "",
              style: "header",
            },
          ],

          // global styles to control pdf styles
          styles: {
            pageTitle: {
              fontSize: 15,
              margin: [20, 0, 0, 10],
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
              margin: [20, 10, 0, 0],
            },
            headerTableInfo: {
              fontSize: 11,
              margin: [20, 0, 20, 0],
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
          pageMargins: [20, 125, 20, 70],
        };
        // console.log(docDefinition);

        // generate pdf file now
        await createPDF(docDefinition, "cashBook");

        // pdf file should be ready by now
        resolve({
          data: true,
          message: "PDF file Generating wait for a sec.",
        });
      }
      // if there was no record found for customerId in stock book
      else {
        resolve({
          data: false,
          message: `No Data Found`,
          // ${
          //   customerId
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

exports.allCustomers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const generalCustomers = await Customer.findAll({
        include: {
          model: AmountType,
          as: "amountType",
          where: {
            type: CONSTANTS.DATABASE_FIELDS.AMOUNT_TYPE.BOTH,
          },
        },
        order: [["name", "ASC"]],
      });
      let allCustomers = "";
      for (const customer of generalCustomers) {
        allCustomers += `*${customer.name}* ➡️ ${thousandSeparator(
          customer.balance
        )}=/ \n`;
      }
      resolve(allCustomers);
    } catch (reason) {
      console.log("Error occur in ALL CUSTOMER customerId for whatsapp");
      reject(reason);
    }
  });
};

exports.getCustomersForSearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const generalCustomers = await Customer.findAll({
        order: [["name", "ASC"]],
      });

      let allCustomers = "Please send a *_number_* from below. \n\n";
      let id = 0;
      for (const customer of generalCustomers) {
        id++;
        allCustomers += `Press *_${id}_* ${id < 10 ? "  ➡️" : " ➡️"} *${
          customer.name
        }* Khata\n`;
      }
      allCustomers += "\n" + CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU;
      resolve(allCustomers);
    } catch (reason) {
      console.log("Error occur in getCustomersForSearch for whatsapp");
      reject(reason);
    }
  });
};

exports.findCustomers = (selectedOption) => {
  return new Promise(async (resolve, reject) => {
    try {
      const generalCustomers = await Customer.findAll({
        order: [["name", "ASC"]],
      });

      let id = 1;
      let customerId = null;
      for (const customer of generalCustomers) {
        if (id === +selectedOption) {
          customerId = customer.id;
        }
        id++;
      }
      resolve(customerId);
    } catch (reason) {
      console.log("Error occur in getCustomersForSearch for whatsapp");
      reject(reason);
    }
  });
};
