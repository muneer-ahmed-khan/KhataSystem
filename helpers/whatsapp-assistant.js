const pdf = require("../services/pdfFile");
const dialogflow = require("../services/dialogflow");
const { CONSTANTS } = require("../config/constants");
const { findQuery } = require("./roznamcha-dialogflow-assistant");
const { MessageMedia } = require("whatsapp-web.js");
const moment = require("moment");

// handle all whatsapp messages here
exports.whatsappHelper = async (client, msg) => {
  // silent all automatic messages and make them seen on whatsapp
  let chat = await msg.getChat();

  await chat.mute();
  await chat.sendSeen();
  const result = await dialogflow.sendQuery(msg.body);

  // control default welcome intent
  if (result.intent === CONSTANTS.WELCOME_INTENT) {
    const contact = await msg.getContact();
    const chat = await msg.getChat();
    chat.sendMessage(`Hi @${contact.number}! \n ${result.response}`, {
      mentions: [contact],
    });
  }
  // handle everything else here
  else {
    // generate pdf for checking today roznamcha
    if (result.intent === CONSTANTS.ROZNAMCHA.QUERIES.TODAY) {
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
    // generate pdf for checking yesterday roznamcha
    else if (result.intent === CONSTANTS.ROZNAMCHA.QUERIES.YESTERDAY) {
      console.log("before requesting yesterday data ", result.response);
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
        client.sendMessage(msg.from, "can't generate yesterday roznamcha");
      }
    }
    // generate pdf for checking weekly roznamcha
    else if (result.intent === CONSTANTS.ROZNAMCHA.QUERIES.WEEK) {
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
        client.sendMessage(msg.from, "can't generate last week roznamcha");
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
      client.sendMessage(msg.from, result.response);
    }
  }
};
