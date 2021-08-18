const readline = require("readline");
const moment = require("moment");

const { join } = require("path");
const fs = require("fs");

const defaultCollections = ["logs", "metadata"];

// converts date to objectId for filter purposes
const objectIdFromDate = function (date) {
  return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

const writeLogsToFile = function (
  upperBound,
  lowerBound,
  collection,
  logsToArchive,
  path
) {
  const date = moment(upperBound).subtract(1, "days");
  const fileDateRange = `${moment(lowerBound).format(
    "YYYY-MM-DD"
  )}-${date.format("YYYY-MM-DD")}`;
  const fileName = `${fileDateRange}-${collection}.json`;
  const absPath = join(path, fileName);
  const data = JSON.stringify(logsToArchive);
  fs.writeFileSync(absPath, data);
  console.info(`logs from collection '${collection}' were offloaded to '${absPath}'`)
};

const checkRemnant = function (lowerBound, cutoffDateObj) {
  return Math.ceil(cutoffDateObj.diff(lowerBound, "days"));
};
///////////////////////////////////////////////////////////////
const ensureIndex = async function (database, collection) {
  const collectionObj = database.collection(collection);
  const indexName = "accountId_1_jobId_1";

  const indexExist = await collectionObj.indexExists(indexName)

  if (indexExist) {
    console.info(
      `index '${indexName}' already exists in collection '${collection}'`
    );
    return;
  }

  const documentsCount = await collectionObj.estimatedDocumentCount();

  const queryStr = `There are approximately ${documentsCount} documents on collection '${collection}'. 
    do you want to create an index for it? (creating an index for a large collection may take a while, 
    but can improve performance on future read operations) [yes/no] `;

  const userInput = await this.getUserInput(queryStr);

  if (!userInput) {
    console.info(`skipping collection '${collection}'`);
    return;
  }

  await collectionObj.createIndex(
    { accountId: 1, jobId: 1 },
  );
  console.info(
    `index '${indexName}' was created for collection '${collection}'`
  );
};

const getUserInput = async function (queryStr) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const questionAsync = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

  try {
    const userInput = (await questionAsync(queryStr)).toLowerCase();

    switch (userInput) {
      case "yes":
      case "y":
        return true;
      case "no":
      case "n":
        return false;
      default:
        console.warn("invalid input");
        return false;
    }
  } finally {
    rl.close();
  }
};

module.exports = {
  objectIdFromDate,
  writeLogsToFile,
  checkRemnant,
  ensureIndex,
  getUserInput,
  defaultCollections,
};
