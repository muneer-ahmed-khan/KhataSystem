const pdf = require("../services/pdfFile");
const dialogflow = require("../services/dialogflow");
const { CONSTANTS } = require("../config/constants");
const { findQuery } = require("./roznamcha-dialogflow-assistant");
const { generateStockBook } = require("../meta/stock-book-whatsapp-queries");
const { generateCashBook } = require("../meta/cash-book-whatsapp-queries");
const { allCustomers } = require("../meta/customers-whatsapp-queries");
const { allStocks } = require("../meta/stock-whatsapp-queries");
const { allBankAccounts } = require("../meta/bank-whatsapp-queries");
const { MessageMedia } = require("whatsapp-web.js");
const moment = require("moment");
// import environment variables
require("dotenv").config();

// create global variables
let currentContext = [];
let lastContext = [];
let lastResponse = null;
let lastIntent = [];
let currentIntent = null;
let eventName = null;

// handle all whatsapp messages here
exports.whatsappHelper = async (client, msg) => {
  console.log("check msg.body ", msg.body);

  // Main Menu Navigation
  const goToMainMenu = async (showText) => {
    const contact = await msg.getContact();
    const chat = await msg.getChat();

    lastResponse = CONSTANTS.MESSAGES_TEMPLATES.MAIN(
      contact.number,
      showText ? result.response : "Welcome"
    );
    // console.log(lastResponse);

    chat.sendMessage(lastResponse, {
      mentions: [contact],
    });
  };

  // silent all automatic messages and make them seen on whatsapp
  let chat = await msg.getChat();

  // first mute for me these messages and make them as seen
  await chat.mute();
  await chat.sendSeen();
  await chat.sendStateTyping();

  // operation to be done before sending query to dialogflow
  // start main menu at start with any number
  if (!currentContext.length && !isNaN(msg.body)) {
    currentContext = ["menu"];
    msg.body = "Hello";
    lastIntent = [];
  }
  // if user want to go back one step back
  if (msg.body === "#") {
    // if user has come on a stage where it meet to starting intent
    if (
      lastIntent &&
      lastIntent.length &&
      lastIntent[lastIntent.length - 1] === CONSTANTS.DIALOGFLOW.WELCOME_INTENT
    ) {
      eventName = "welcome";
      currentContext = ["menu"];
      lastIntent = [];
      currentIntent = null;
    }
    // handle forward and backward menu functionally
    else {
      eventName = lastIntent.pop();
      currentContext = lastContext;
    }
  }
  // handle the use case when user from any screen can access the main menu
  else if (msg.body == 0) {
    currentContext = ["menu"];
    msg.body = "Hello";
    lastIntent = [];
  }

  // if there is eventName then don't push the current intent
  if (!eventName) {
    lastIntent.push(currentIntent);
  }

  // send request to dialogflow
  const result = await dialogflow.sendQuery(
    msg.body,
    currentContext,
    eventName
  );

  // if we fall to fallback in the process then need to give user a chance
  if (result.intent !== CONSTANTS.DIALOGFLOW.FALLBACK_INTENT) {
    // if it was not fall back intent then remove old input context
    lastContext = currentContext;
    currentContext = [];

    // save the last intent name
    currentIntent = result.intent;

    // save all context output contexts names here except the fallback contexts
    for (let index = 0; index < result.context.length; index++) {
      if (
        result.context[index].name.split("/")[
          result.context[index].name.split("/").length - 1
        ] !== "__system_counters__" &&
        result.context[index].name.split("/")[
          result.context[index].name.split("/").length - 1
        ] !== "defaultfallbackintent-followup"
      )
        currentContext.push(
          result.context[index].name.split("/")[
            result.context[index].name.split("/").length - 1
          ]
        );
    }
  }

  // empty back the eventName on response back
  eventName = null;

  console.log("response current context ==> ", currentContext);
  console.log("response last context ==> ", lastContext);
  console.log("check result ---> ", result);

  // stop recording for whatsapp
  await chat.clearState();

  // handle the Welcome intent here
  if (result.intent === CONSTANTS.DIALOGFLOW.WELCOME_INTENT) {
    // show welcome message
    goToMainMenu(true);
  }

  // handle everything else here
  else {
    // handle all stock book related intents here
    // handle if we select stock book from main menu
    if (result.intent === CONSTANTS.DIALOGFLOW.STOCK_BOOK) {
      // show all stock book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.STOCK_BOOK;
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to add entry to stock book
    else if (result.intent === CONSTANTS.DIALOGFLOW.ADD_TO_STOCK_BOOK) {
      // show add to stock book form to user
      lastResponse = result.response;
      // save the current user id for group ack
      CONSTANTS.CURRENT_USER_ID = msg.from;
      console.log(lastResponse, CONSTANTS.CURRENT_USER_ID);

      // send user the form link to filled
      chat.sendMessage(lastResponse);
      chat.sendMessage(
        CONSTANTS.MESSAGES_TEMPLATES.SEND_LINK(
          process.env.NGROK_URL +
            CONSTANTS.WHATSAPP_FORMS_URLS.ADD_TO_STOCK_BOOK
        )
      );
    }
    // handle if user want to add sell entry to stock book
    else if (result.intent === CONSTANTS.DIALOGFLOW.SELL_FROM_STOCK_BOOK) {
      // show all stock book options
      lastResponse = result.response;
      // save the current user id for group ack
      CONSTANTS.CURRENT_USER_ID = msg.from;
      console.log(lastResponse);

      // send user the form link to filled
      chat.sendMessage(lastResponse);
      chat.sendMessage(
        CONSTANTS.MESSAGES_TEMPLATES.SEND_LINK(
          process.env.NGROK_URL +
            CONSTANTS.WHATSAPP_FORMS_URLS.SELL_FROM_STOCK_BOOK
        )
      );
    }
    // handle if user want to add view stock book
    else if (result.intent === CONSTANTS.DIALOGFLOW.VIEW_STOCK_BOOK) {
      // show all stock book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_BOOK("Stock");
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to view today stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_TODAY
    ) {
      const getStockBook = await generateStockBook(result.response);
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getStockBook.message);
      if (getStockBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.STOCK_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        // console.log("check ", media);
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to view yesterday stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_YESTERDAY
    ) {
      const getStockBook = await generateStockBook(result.response);
      // show to user yesterday stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getStockBook.message);
      if (getStockBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.STOCK_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to view last week stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_WEEK
    ) {
      // show to user last week stock book
      lastResponse = result.response;
      console.log(lastResponse);
      const getStockBook = await generateStockBook(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getStockBook.message);
      if (getStockBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.STOCK_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to view last month stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK +
        CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_MONTH
    ) {
      // show to user last week stock book
      lastResponse = result.response;
      console.log(lastResponse);
      const getStockBook = await generateStockBook(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getStockBook.message);
      if (getStockBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.STOCK_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to search stock book by date
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_DATE
    ) {
      // show user the search by date form
      lastResponse = result.response;
      // save the current user id for group ack
      // CONSTANTS.CURRENT_USER_ID = msg.from;
      console.log(lastResponse);

      // send user the form link to filled
      chat.sendMessage(lastResponse);
      chat.sendMessage(
        CONSTANTS.MESSAGES_TEMPLATES.SEND_LINK(
          process.env.NGROK_URL +
            CONSTANTS.WHATSAPP_FORMS_URLS.SEARCH_STOCK_BOOK +
            msg.from
        )
      );
    }

    // <============ Stock Book Queries Ended here =====================>

    // handle all cash book related intents here
    // handle if we select cash book from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.CASH_BOOK) {
      // show all stock book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.CASH_BOOK;
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to credit entry to CASH book
    else if (result.intent === CONSTANTS.DIALOGFLOW.CREDIT_TO_CASH_BOOK) {
      // show credit to cash book form to user
      lastResponse = result.response;
      // save the current user id for group ack
      CONSTANTS.CURRENT_USER_ID = msg.from;
      console.log(lastResponse, CONSTANTS.CURRENT_USER_ID);

      // send user the form link to filled
      chat.sendMessage(lastResponse);
      chat.sendMessage(
        CONSTANTS.MESSAGES_TEMPLATES.SEND_LINK(
          process.env.NGROK_URL +
            CONSTANTS.WHATSAPP_FORMS_URLS.CREDIT_TO_CASH_BOOK
        )
      );
    }
    // handle if user want to add debit entry to CASH book
    else if (result.intent === CONSTANTS.DIALOGFLOW.DEBIT_FROM_CASH_BOOK) {
      // show debit from cash book form to user
      lastResponse = result.response;
      // save the current user id for group ack
      CONSTANTS.CURRENT_USER_ID = msg.from;
      console.log(lastResponse, CONSTANTS.CURRENT_USER_ID);

      // send user the form link to filled
      chat.sendMessage(lastResponse);
      chat.sendMessage(
        CONSTANTS.MESSAGES_TEMPLATES.SEND_LINK(
          process.env.NGROK_URL +
            CONSTANTS.WHATSAPP_FORMS_URLS.DEBIT_FROM_CASH_BOOK
        )
      );
    }
    // handle if user want to add view CASH book
    else if (result.intent === CONSTANTS.DIALOGFLOW.VIEW_CASH_BOOK) {
      // show all CASH book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_BOOK("CASH");
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to view today CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_TODAY
    ) {
      const getCashBook = await generateCashBook(result.response);
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getCashBook.message);
      if (getCashBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.CASH_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        // console.log("check ", media);
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to view yesterday CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_YESTERDAY
    ) {
      const getCashBook = await generateCashBook(result.response);
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getCashBook.message);
      if (getCashBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.CASH_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        // console.log("check ", media);
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to view last week CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_WEEK
    ) {
      const getCashBook = await generateCashBook(result.response);
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getCashBook.message);
      if (getCashBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.CASH_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        // console.log("check ", media);
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to view last month CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_MONTH
    ) {
      const getCashBook = await generateCashBook(result.response);
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getCashBook.message);
      if (getCashBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.CASH_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        // console.log("check ", media);
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }
    // handle if user want to search CASH book by date
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_DATE
    ) {
      // show user the search by date form
      lastResponse = result.response;
      // save the current user id for group ack
      // CONSTANTS.CURRENT_USER_ID = msg.from;
      console.log(lastResponse);

      // send user the form link to filled
      chat.sendMessage(lastResponse);
      chat.sendMessage(
        CONSTANTS.MESSAGES_TEMPLATES.SEND_LINK(
          process.env.NGROK_URL +
            CONSTANTS.WHATSAPP_FORMS_URLS.SEARCH_CASH_BOOK +
            msg.from
        )
      );
    }

    // <============ Cash Book Queries Ended here =====================>

    // handle if we select customer khata from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.CUSTOMERS_KHATA) {
      // view customer khata details
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_KHATA(
        "Customers Bal.",
        "Customer"
      );
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to view today CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CUSTOMERS_KHATA + CONSTANTS.DIALOGFLOW.ALL_KHATA
    ) {
      const getAllCustomers = await allCustomers();

      // show to user today stock book
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.ALL_KHATA(
        "*Customers* Balance",
        getAllCustomers
      );
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(lastResponse);
    }
    // handle if user want to view today CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CUSTOMERS_KHATA + CONSTANTS.DIALOGFLOW.SEARCH_BY_DATE
    ) {
      const getCashBook = await generateCashBook(result.response);
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(getCashBook.message);
      if (getCashBook.data) {
        const media = MessageMedia.fromFilePath(
          `${
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.CASH_BOOK_FILE_PATH
          }${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );
        // console.log("check ", media);
        await chat.sendMessage(media);
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.BACK_MENU);
      }
    }

    // <============ Customer Khata Queries Ended here =====================>

    // handle if we select bank khata from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.BANK_KHATA) {
      // view bank khata details
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_KHATA(
        "Banks Acc Bal.",
        "Bank"
      );
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to view today CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.BANK_KHATA + CONSTANTS.DIALOGFLOW.ALL_KHATA
    ) {
      const getAllBankAccounts = await allBankAccounts();

      // show to user today stock book
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.ALL_KHATA(
        "*Bank Acc.* Balance",
        getAllBankAccounts
      );
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(lastResponse);
    }

    // <============ Bank Khata Queries Ended here =====================>

    // handle if we select stock khata from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.STOCK_KHATA) {
      // view stock khata details
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_KHATA(
        "Stock QTY.",
        "Stock"
      );
      console.log(lastResponse);
      chat.sendMessage(lastResponse);
    }
    // handle if user want to view today CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_KHATA + CONSTANTS.DIALOGFLOW.ALL_KHATA
    ) {
      const getAllStocks = await allStocks();

      // show to user today stock book
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.ALL_KHATA(
        "*Stock* QTY",
        getAllStocks
      );
      console.log(lastResponse);

      // generate today stock book pdf for user
      chat.sendMessage(lastResponse);
    }

    // everything else is dialogflow result by default
    else {
      // if at any stage fallback intent occur then show the last response
      if (result.intent === CONSTANTS.DIALOGFLOW.FALLBACK_INTENT) {
        // console.log(
        //   "you have selected a wrong option Please try again! \n ",
        //   lastResponse
        // );
        chat.sendMessage(result.response);
        chat.sendMessage(lastResponse);
      } else {
        console.log("coming in else case ", result.response);
        // lastContext = null;

        chat.sendMessage(result.response);
      }
    }
  }
};
