const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
exports.sendQuery = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      // A unique identifier for the given session
      const sessionId = uuid.v4();
      let projectId = "khata-system-oypk";
      // Create a new session
      const sessionClient = new dialogflow.SessionsClient({
        keyFilename: "./khata-system-oypk-8e079c69b389.json",
      });
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

      // Send request and log result
      const responses = await sessionClient.detectIntent(request);
      console.log("Detected intent");
      const result = responses[0].queryResult;
      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);

      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);

        resolve(result.fulfillmentText);
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
