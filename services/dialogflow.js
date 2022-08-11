const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");
const pb = require("pb-util");

let projectId = "khata-system-oypk";
let keyFilename = "./khata-system-oypk-8e079c69b389.json";
// A unique identifier for the given session
const sessionId = uuid.v4();
// Create a new session
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: keyFilename,
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} query The project to be used
 */
exports.sendQuery = (query, InputContext) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
      );

      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            // The query to send to the dialogflow agent
            text: query,
            // The language used by the client (en-US)
            languageCode: "en-US",
          },
        },
      };

      let contexts = [];
      // set here the input contexts for dialogflow requests
      for (let index = 0; index < InputContext.length; index++) {
        contexts.push({
          name: `projects/${projectId}/agent/sessions/${sessionId}/contexts/${InputContext[index]}`,
          lifespanCount: 1,
        });
      }
      if (InputContext.length)
        request.queryParams = {
          contexts: contexts,
        };

      console.log("check dialogflow request ==> ", query, InputContext);

      // Send request and log result
      const responses = await sessionClient.detectIntent(request);

      const result = responses[0].queryResult;
      let outputContext = responses[0].queryResult.outputContexts;

      // console.log(`  Query: ${result.queryText}`);
      // console.log(`  Response: ${result.fulfillmentText}`);

      if (result.intent) {
        // console.log(`  Intent: ${result.intent.displayName}`);

        resolve({
          response: result.fulfillmentText,
          intent: result.intent.displayName,
          context: outputContext,
        });
      } else {
        console.log("  No intent matched.");
        resolve(null);
      }
    } catch (reason) {
      console.log("failed in dialogflow function call ", reason);
      reject(null);
    }
  });
};
