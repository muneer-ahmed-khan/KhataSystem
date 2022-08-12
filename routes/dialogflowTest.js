const express = require("express");
const router = express.Router();

const dialogflow = require("../services/dialogflow");
const { CONSTANTS } = require("../config/constants");

let currentContext = [];
let lastContext = [];
let lastResponse = null;
let lastIntent = [];
let currentIntent = null;
let eventName = null;

router.post("/test", async (req, res) => {
  console.log("check req.body ", req.body);

  // if there is 0 then go to main menu
  if (!currentContext.length && !isNaN(req.body.msg)) {
    currentContext = ["menu"];
    req.body.msg = "Hello";
    lastIntent = [];
  }
  // if user want to go back one step
  if (req.body.msg === "#") {
    if (
      lastIntent &&
      lastIntent.length &&
      lastIntent[lastIntent.length - 1] === CONSTANTS.DIALOGFLOW.WELCOME_INTENT
    ) {
      eventName = "welcome";
      currentContext = ["menu"];
      lastIntent = [];
      currentIntent = null;
    } else {
      eventName = lastIntent.pop();
      currentContext = lastContext;
      // req.body.msg = "";
    }
  }
  // handle the use case when user from any screen can access the main menu
  else if (req.body.msg === 0) {
    currentContext = ["menu"];
    req.body.msg = "Hello";
    lastIntent = [];
  }

  if (!eventName) {
    lastIntent.push(currentIntent);
  }

  // save the current intent to last intent name
  // lastIntent = currentIntent;

  // save the current context to last context
  // lastContext = currentContext;

  const result = await dialogflow.sendQuery(
    req.body.msg,
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
    // lastIntent.push(result.intent);
    // console.log("response current intent ==> ", result.intent);
    // console.log("response last intent ==> ", lastIntent);

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
  // if at any stage fallback intent occur then show the last response
  else if (result.intent === CONSTANTS.DIALOGFLOW.FALLBACK_INTENT) {
    console.log(
      "you have selected a wrong option Please try again! \n ",
      lastResponse
    );
  }
  // empty back the eventName on response back
  eventName = null;

  console.log("response current context ==> ", currentContext);
  console.log("response last context ==> ", lastContext);

  console.log("check result ---> ", result);
  // handle the Welcome intent here
  if (result.intent === CONSTANTS.DIALOGFLOW.WELCOME_INTENT) {
    // show welcome message
    lastResponse = CONSTANTS.MESSAGES_TEMPLATES.MAIN("Welcome", "End");
    console.log(lastResponse);
  } else {
    // handle all stock book related intents here
    // handle if we select stock book from main menu
    if (result.intent === CONSTANTS.DIALOGFLOW.STOCK_BOOK) {
      // show all stock book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.STOCK_BOOK;
      console.log(lastResponse);
    }
    // handle if user want to add entry to stock book
    else if (result.intent === CONSTANTS.DIALOGFLOW.ADD_TO_STOCK_BOOK) {
      // show all stock book options
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to add sell entry to stock book
    else if (result.intent === CONSTANTS.DIALOGFLOW.SELL_FROM_STOCK_BOOK) {
      // show all stock book options
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to add view stock book
    else if (result.intent === CONSTANTS.DIALOGFLOW.VIEW_STOCK_BOOK) {
      // show all stock book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_BOOK("Stock");
      console.log(lastResponse);
    }
    // handle if user want to view today stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_TODAY
    ) {
      // show to user today stock book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to view yesterday stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_YESTERDAY
    ) {
      // show to user yesterday stock book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to view last week stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_WEEK
    ) {
      // show to user last week stock book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to view last month stock book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK +
        CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_MONTH
    ) {
      // show to user last month stock book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to search stock book by date
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.STOCK_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_DATE
    ) {
      // show to user search by date form
      lastResponse = result.response;
      console.log(lastResponse);
    }

    // handle all cash book related intents here
    // handle if we select cash book from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.CASH_BOOK) {
      // show all stock book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.CASH_BOOK;
      console.log(lastResponse);
    }
    // handle if user want to credit entry to CASH book
    else if (result.intent === CONSTANTS.DIALOGFLOW.CREDIT_TO_CASH_BOOK) {
      // show all CASH book options
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to add debit entry to CASH book
    else if (result.intent === CONSTANTS.DIALOGFLOW.DEBIT_FROM_CASH_BOOK) {
      // show all CASH book options
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to add view CASH book
    else if (result.intent === CONSTANTS.DIALOGFLOW.VIEW_CASH_BOOK) {
      // show all CASH book options
      lastResponse = CONSTANTS.MESSAGES_TEMPLATES.VIEW_BOOK("CASH");
      console.log(lastResponse);
    }
    // handle if user want to view today CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_TODAY
    ) {
      // show to user today CASH book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to view yesterday CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_YESTERDAY
    ) {
      // show to user yesterday CASH book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to view last week CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_WEEK
    ) {
      // show to user last week CASH book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to view last month CASH book
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_LAST_MONTH
    ) {
      // show to user last month CASH book
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if user want to search CASH book by date
    else if (
      result.intent ===
      CONSTANTS.DIALOGFLOW.CASH_BOOK + CONSTANTS.DIALOGFLOW.SEARCH_BY_DATE
    ) {
      // show to user search by date form
      lastResponse = result.response;
      console.log(lastResponse);
    }

    // handle if we select customer khata from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.CUSTOMERS_KHATA) {
      // view customer khata details
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if we select bank khata from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.BANK_KHATA) {
      // view bank khata details
      lastResponse = result.response;
      console.log(lastResponse);
    }
    // handle if we select stock khata from main menu
    else if (result.intent === CONSTANTS.DIALOGFLOW.STOCK_KHATA) {
      // view stock khata details
      lastResponse = result.response;
      console.log(lastResponse);
    }
  }

  res.sendStatus(200);
});

module.exports = router;
