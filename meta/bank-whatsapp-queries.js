const moment = require("moment");
const Sequelize = require("sequelize");
const { BankAccount, Customer } = require("../models");
const { CONSTANTS } = require("../config/constants");
const { createPDF } = require("../services/pdfFile");
const { thousandSeparator } = require("../helpers/helpers");

exports.generateBankAccountKhata = (bankAccountId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let bankAccount;
      console.log("check bankAccountId ", bankAccountId);
      // search stock book by different time date queries
      // find bankAccount by in db
      bankAccount = await BankAccount.findByPk(bankAccountId);
      // if we don't find bankAccount then do nothing in that case
      // if (!bankAccount) {
      //   return res.redirect("/bankAccount");
      // }

      // create bankAccount information array first
      const bankAccountDetails = [];

      // initiate bankAccount balance from bankAccount starting balance
      let bankAccountBalance = bankAccount.startingBalance;

      // add starting stock to first array
      bankAccountDetails.push({
        startingBalance: bankAccountBalance,
      });

      // get bank account details from cash book
      const cashBookDetails = await bankAccount.getCashBook({
        include: [
          {
            model: Customer,
            as: "customer",
          },
        ],
        order: [["id", "ASC"]],
      });

      for (let [key, value] of cashBookDetails.entries()) {
        bankAccountBalance =
          value.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
            ? Number(bankAccountBalance) + Number(value.amount)
            : value.entryType ===
              CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
            ? Number(bankAccountBalance) - Number(value.amount)
            : Number(bankAccountBalance);

        bankAccountDetails.push({
          Date: value.updatedAt,
          entryType: value.entryType,
          customerDetails: value.customer
            ? value.customer.name
            : value.cashCustomer,
          paymentType: value.paymentType,
          credit:
            value.entryType ===
            CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
              ? value.amount
              : 0,
          debit:
            value.entryType ===
            CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
              ? value.amount
              : 0,
          balance: bankAccountBalance,
        });
      }

      // create pdf file table columns and data
      let bankAccountKhataDetails = [];
      bankAccountKhataDetails.push([
        { text: "#ID", style: "tableHeaderColumns" },
        { text: "Date", style: "tableHeaderColumns" },
        { text: "Customer", style: "tableHeaderColumnsLeft" },
        { text: "Pay Type", style: "tableHeaderColumns" },
        { text: "Credit +", style: "tableHeaderColumnsLeft" },
        { text: "Debit -", style: "tableHeaderColumnsLeft" },
        { text: "Balance", style: "tableHeaderColumnsLeft" },
      ]);

      // check if we have records in stock book so far
      // console.log("check stock book length first ", bankAccountDetails);
      if (bankAccountDetails.length > 1) {
        let fromDate, toDate;
        // Get From date
        toDate = new Date(
          Math.max(
            ...bankAccountDetails.map((element) => {
              return new Date(element.Date);
            })
          )
        );

        // Get To date
        fromDate = new Date(
          Math.min(
            ...bankAccountDetails.map((element) => {
              if (element.Date) return new Date(element.Date);
              else return new Date();
            })
          )
        );

        let totalCredit = 0,
          totalDebit = 0;

        bankAccountDetails.map((ele) => {
          if (
            ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.CREDIT_AMOUNT
          )
            totalCredit += Number(ele.credit);
          else if (
            ele.entryType === CONSTANTS.DATABASE_FIELDS.ENTRY_TYPE.DEBIT_AMOUNT
          )
            totalDebit += Number(ele.debit);
        });

        for (let index = 0; index < bankAccountDetails.length; index++) {
          if (index === 0) {
            bankAccountKhataDetails.push([
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "", style: "" },
              { text: "Start", style: "tableHeaderColumnsRight" },
              {
                text: thousandSeparator(
                  bankAccountDetails[index].startingBalance
                ),
                style: "tableHeaderColumnsLeft",
              },
            ]);
          } else {
            bankAccountKhataDetails.push([
              { text: index, style: "tableCell" },
              {
                text: new moment(bankAccountDetails[index].Date).format(
                  "DD-MM-YYYY"
                ),
                style: "tableCell",
              },
              {
                text: bankAccountDetails[index].customerDetails,
                style: "tableCellLeft",
              },
              {
                text: bankAccountDetails[index].paymentType.toUpperCase(),
                style: "tableCell",
              },
              {
                text: thousandSeparator(bankAccountDetails[index].credit),
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(bankAccountDetails[index].debit),
                style: "tableCellLeft",
              },
              {
                text: thousandSeparator(bankAccountDetails[index].balance),
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
                  { text: `${bankAccount.accountName}`, style: { bold: true } },
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
                              bankAccountId ===
                              CONSTANTS.ROZNAMCHA.QUERIES.TODAY
                                ? new moment().format("DD-MM-YYYY")
                                : bankAccountId ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY
                                ? new moment()
                                    .subtract(1, "days")
                                    .format("DD-MM-YYYY")
                                : bankAccountId ===
                                  CONSTANTS.ROZNAMCHA.QUERIES.WEEK
                                ? new moment()
                                    .subtract(1, "week")
                                    .format("DD-MM-YYYY")
                                : bankAccountId ===
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
                              bankAccountId !==
                              CONSTANTS.ROZNAMCHA.QUERIES.TOTAL
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
            // insert the table that is created by bankAccountId data
            {
              style: "tableExample",

              table: {
                headerRows: 1,
                widths: ["auto", "auto", 145, "auto", 60, 60, 60],
                body: bankAccountKhataDetails,
              },
            },
            // print on pdf if there  is no data found for bankAccountId
            {
              text: bankAccountKhataDetails.length === 0 ? "No Data yet" : "",
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
        await createPDF(docDefinition, "cashBook");

        // pdf file should be ready by now
        resolve({
          data: true,
          message: "PDF file Generating wait for a sec.",
        });
      }
      // if there was no record found for bankAccountId in stock book
      else {
        resolve({
          data: false,
          message: `No Data Found`,
          // ${
          //   bankAccountId
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

exports.allBankAccounts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allAccounts = await BankAccount.findAll({
        order: [["accountName", "ASC"]],
      });
      let allBanks = "";
      for (const account of allAccounts) {
        allBanks += `*${account.accountName}* ➡️  ${thousandSeparator(
          account.balance
        )}=/ \n`;
      }
      resolve(allBanks);
    } catch (reason) {
      console.log("Error occur in ALL CUSTOMER query for whatsapp");
      reject(reason);
    }
  });
};

exports.getBankAccountsForSearch = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const bankAccounts = await BankAccount.findAll({
        order: [["accountName", "ASC"]],
      });

      let allBankAccounts = "Please send a *_number_* from below. \n\n";
      let id = 0;
      for (const account of bankAccounts) {
        id++;
        allBankAccounts += `Press *_${id}_* ${id < 10 ? "  ➡️" : " ➡️"} *${
          account.accountName
        }* Khata\n`;
      }
      allBankAccounts += "\n" + CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU;
      resolve(allBankAccounts);
    } catch (reason) {
      console.log("Error occur in getBankAccountsForSearch for whatsapp");
      reject(reason);
    }
  });
};

exports.findBankAccounts = (selectedOption) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bankAccounts = await BankAccount.findAll({
        order: [["accountName", "ASC"]],
      });

      let id = 1;
      let bankAccountId = null;
      for (const account of bankAccounts) {
        if (id === +selectedOption) {
          bankAccountId = account.id;
        }
        id++;
      }
      resolve(bankAccountId);
    } catch (reason) {
      console.log("Error occur in getCustomersForSearch for whatsapp");
      reject(reason);
    }
  });
};
