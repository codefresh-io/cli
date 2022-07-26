/* eslint-disable */ 
const readline = require("readline");
const moment = require("moment");
const { ObjectId } = require("mongodb")

const { join } = require("path");
const fs = require("fs");

const defaultCollections = ["logs", "metadata"];

// converts date to objectId for filter purposes
const objectIdFromDate = function (date) {
  return Math.floor(date.getTime() / 1000).toString(16) + "0000000000000000";
};

const writeLogsToFile = async function (
  upperBound,
  lowerBound,
  collection,
  logsCursor,
  path
) {
  const fileName = `${createRangeStr(lowerBound, upperBound, collection)}.json`
  const absPath = join(path, fileName);
  const stream = fs.createWriteStream(absPath)
  stream.write("[ ")

  while ( !logsCursor.isClosed() && (await logsCursor.hasNext())) {
    const doc = await logsCursor.next()
    const data = JSON.stringify(doc);
    stream.write(data)

    if (await logsCursor.hasNext()) {
      stream.write(", ")
    }
  }
  
  stream.write(" ]")
  stream.close()

  console.info(`logs from collection '${collection}' were offloaded to '${absPath}'`)
};

const createRangeStr = function(lowerBound, upperBound, collection) {
  const upperBoundDate = moment(upperBound).subtract(1, "days");
  const fileDateRange = `${moment(lowerBound).format(
    "YYYY-MM-DD"
  )}-${upperBoundDate.format("YYYY-MM-DD")}`;
  return `${fileDateRange}-${collection}`;
}

const getMinDate = function(minLog) {
  const minLogId = ObjectId(minLog._id)
  return moment(
    minLogId.getTimestamp()
  ).startOf("day");
}

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
    { background: true },
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

const collectionExists = async function(dbObject, targetCollection) {
  const collectionsObjectList = await dbObject.listCollections().toArray();
  const collectionsList = collectionsObjectList.map((object) => {
    return object.name;
  })
  return (collectionsList.indexOf(targetCollection) >= 0);
}

const findMinLog = async function(collectionObj, UpperBoundDateId, collection) {
  const minLog = await collectionObj
    .find({ _id: { $lt: ObjectId(UpperBoundDateId) } })
    .sort({ _id: 1 })
    .limit(1)
    .toArray();

  if (minLog.length === 0) {
    return undefined;
  }

  return minLog[0];
}

const checkCursorState = function (cursor, collection, targetCollection) {
  if (!cursor.cursorState.killed) {
    console.info(
      `logs from '${collection}' were archived to '${targetCollection}'`
    );
    return;
  } else {
    throw new Error(
      "Cursor error. Archiving operation may not be completed.\
      The old logs were not deleted from the source collection."
    );
  }
}

module.exports = {
  objectIdFromDate,
  writeLogsToFile,
  checkRemnant,
  ensureIndex,
  getUserInput,
  collectionExists,
  findMinLog,
  checkCursorState,
  createRangeStr,
  getMinDate,
  defaultCollections,
};
