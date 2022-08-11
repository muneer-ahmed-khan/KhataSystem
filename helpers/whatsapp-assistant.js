const pdf = require("../services/pdfFile");
const dialogflow = require("../services/dialogflow");
const { CONSTANTS } = require("../config/constants");
const { findQuery } = require("./roznamcha-dialogflow-assistant");
const { MessageMedia } = require("whatsapp-web.js");
const moment = require("moment");

// define global context
let lastContext = CONSTANTS.DIALOGFLOW.M1;

// handle all whatsapp messages here
exports.whatsappHelper = async (client, msg) => {
  // Main Menu Navigation
  const goToMainMenu = async (showText) => {
    const contact = await msg.getContact();
    const chat = await msg.getChat();
    chat.sendMessage(
      CONSTANTS.MESSAGES_TEMPLATES.MAIN(
        contact.number,
        showText ? result.response : "Welcome"
      ),
      {
        mentions: [contact],
      }
    );
  };

  // silent all automatic messages and make them seen on whatsapp
  let chat = await msg.getChat();

  await chat.mute();
  await chat.sendSeen();
  const result = await dialogflow.sendQuery(msg.body, lastContext);

  // control default welcome intent
  if (result.intent === CONSTANTS.DIALOGFLOW.WELCOME_INTENT) {
    // update context now
    lastContext = result.context;
    goToMainMenu(true);
  }
  // handle everything else here
  else {
    // handle if we select first option from Main list Main Menu --> option
    if (result.intent === CONSTANTS.DIALOGFLOW.M1) {
      console.log("coming in M1 ", result.context);
      // update context now
      lastContext = result.context;
      const chat = await msg.getChat();

      if (result.response == 1)
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.M1);
      else if (result.response == 2)
        chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.M2);
      else chat.sendMessage(" new Things are in progress");
    }
    // handle if we select first option from Main list Main Menu --> option
    else if (
      result.intent === CONSTANTS.DIALOGFLOW.M1 &&
      result.response === 2
    ) {
      console.log("coming in M1 ", result.context);
      // update context now
      lastContext = result.context;
      const chat = await msg.getChat();
      chat.sendMessage(CONSTANTS.MESSAGES_TEMPLATES.M1);
    }
    // handle if we select first option from Main Menu --> option --> option
    else if (result.intent === CONSTANTS.DIALOGFLOW.M1_1) {
      console.log("coming in M1-1 ", result.context);

      lastContext = result.context;
      const chat = await msg.getChat();
      // check if user has selected option for Main Menu
      if (result.response == 0) {
        goToMainMenu();
      }
      // handle the case while user select option other then 0
      else {
        if (result.response == 1)
          chat.sendMessage(" Show add to stock Book Form");
        else if (result.response == 2)
          chat.sendMessage(" Show sell from stock Book Form");
        else chat.sendMessage(" View from stock book template ");
      }
    }
    // generate pdf for checking today roznamcha
    else if (result.intent === CONSTANTS.ROZNAMCHA.QUERIES.TODAY) {
      const getRoznamcha = await findQuery(result.response);
      // if there is data found then data is true
      if (getRoznamcha.data) {
        // get file path to generate as pdf
        const media = MessageMedia.fromFilePath(
          `${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_PATH}${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );

        // these updates should be received by user in response
        client.sendMessage(msg.from, getRoznamcha.message);
        client.sendMessage(msg.from, media);
      }
      // if no date available for this query
      else if (getRoznamcha.data === false) {
        client.sendMessage(msg.from, getRoznamcha.message);
      } else {
        client.sendMessage(msg.from, "can't generate today roznamcha");
      }
    }
    // generate pdf for checking monthly roznamcha
    else if (result.intent === CONSTANTS.ROZNAMCHA.QUERIES.MONTH) {
      const getRoznamcha = await findQuery(result.response);

      if (getRoznamcha.data) {
        const media = MessageMedia.fromFilePath(
          `${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_PATH}${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );

        client.sendMessage(msg.from, getRoznamcha.message);
        client.sendMessage(msg.from, media);
      } else if (getRoznamcha.data === false) {
        client.sendMessage(msg.from, getRoznamcha.message);
      } else {
        client.sendMessage(msg.from, "can't generate last month roznamcha");
      }
    }
    // generate pdf for checking total roznamcha
    else if (result.intent === CONSTANTS.ROZNAMCHA.QUERIES.TOTAL) {
      const getRoznamcha = await findQuery(result.response);

      if (getRoznamcha.data) {
        const media = MessageMedia.fromFilePath(
          `${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_PATH}${new moment().format(
            CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_DATE_FORMAT
          )}${CONSTANTS.ROZNAMCHA.FILE_SETTINGS.FILE_FORMAT}`
        );

        client.sendMessage(msg.from, getRoznamcha.message);
        client.sendMessage(msg.from, media);
      } else if (getRoznamcha.data === false) {
        client.sendMessage(msg.from, getRoznamcha.message);
      } else {
        client.sendMessage(msg.from, "can't generate total roznamcha");
      }
    }

    // everything else is dialogflow result by default
    else {
      console.log("coming in else case ");
      lastContext = null;
      client.sendMessage(msg.from, result.response);
    }
  }
};
