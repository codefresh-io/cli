const { MongoClient, ObjectId } = require("mongodb");
const moment = require("moment");
const semver = require("semver");
const Command = require("../../Command");
const cmd = require("./base.cmd");
const {
  objectIdFromDate,
  defaultCollections,
  collectionExists,
  findMinLog,
  checkCursorState,
  createRangeStr,
  getMinDate,
} = require("./utils");

const offloadToCollection = async function (
  sourceDBObj,
  collection,
  targetDB,
  cutoffDate
) {
  const sourceCollectionObj = sourceDBObj.collection(collection);

  const cutoffDateObj = moment(cutoffDate).add(1, "days").startOf("day");

  if (!cutoffDateObj.isValid()) {
    throw new Error("please enter a valid date in ISO 8601 format");
  }

  const cutoffDateId = objectIdFromDate(cutoffDateObj.toDate());

  const minLog = await findMinLog(
    sourceCollectionObj,
    cutoffDateId,
    collection
  );

  if (!minLog) {
    console.info(
      `No logs to archive in collection ${collection} from the given date.`
    );
    return;
  }

  const lowerBound = getMinDate(minLog);
  const upperBound = moment(cutoffDateObj);
  const targetCollection = `${createRangeStr(
    lowerBound,
    upperBound,
    collection
  )}-archive`;

  const mongoInfo = await sourceDBObj.admin().serverInfo();
  const mongoServerVersion = await mongoInfo.version;
  const mergeReleaseVersion = "4.2.0";

  if (semver.lte(mergeReleaseVersion, mongoServerVersion)) {
    await archiveWithMerge(
      sourceCollectionObj,
      cutoffDateId,
      targetDB,
      targetCollection,
      collection
    );
  } else {
    await archiveWithOut(
      sourceCollectionObj,
      cutoffDateId,
      targetCollection,
      collection
    );
  }
};
///////////////////////////////////////////////////////////////////////////////////
const archiveWithMerge = async function (
  sourceCollectionObj,
  cutoffDateId,
  targetDB,
  targetCollection,
  collection
) {
  var result = sourceCollectionObj.aggregate([
    { $match: { _id: { $lte: ObjectId(cutoffDateId) } } },
    {
      $merge: {
        into: { db: targetDB, coll: targetCollection },
        on: "_id",
        whenMatched: "keepExisting",
        whenNotMatched: "insert",
      },
    },
  ]);

  await result.toArray();

  checkCursorState(result, collection, targetCollection);

  await sourceCollectionObj.deleteMany({
    _id: { $lte: ObjectId(cutoffDateId) },
  });
};
///////////////////////////////////////////////////////////////////////////////////
const archiveWithOut = async function (
  sourceCollectionObj,
  cutoffDateId,
  targetCollection,
  collection
) {
  var result = sourceCollectionObj.aggregate([
    { $match: { _id: { $lte: ObjectId(cutoffDateId) } } },
    { $out: targetCollection },
  ]);

  await result.toArray();

  checkCursorState(result, collection, targetCollection);

  await sourceCollectionObj.deleteMany({
    _id: { $lte: ObjectId(cutoffDateId) },
  });
};
///////////////////////////////////////////////////////////////////////////////////
const command = new Command({
  command: "offload-to-collection",
  parent: cmd,
  description:
    "Archiving logs from one or more source collections to target collections.",
  webDocs: {
    category: "Logs",
    title: "Offload To Collection",
  },
  builder: (yargs) =>
    yargs
      .option("targetDB", {
        alias: "tdb",
        describe:
          "This option is available only for mongodb version 4.2 and up. for older versions it will be ignored. \
          Target database name, if none inserted, db will be defined as target.",
        type: "string",
      })
      .option("cutoffDate", {
        alias: "cod",
        describe:
          "The date in ISO format (yyyy-MM-dd) from which logs will be archived (going backwards, including logs from that day).",
        demandOption: true,
        type: "string",
      })
      .example(
        'codefresh offline-logs offload-to-collection --uri "mongodb://192.168.99.100:27017" --db logs --cod "2021-07-08" '
      ),
  handler: async (argv) => {
    const { uri, db, targetDB, cutoffDate } = argv;

    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
      await client.connect();
      const failedCollections = [];
      const errors = [];
      const sourceDBObj = client.db(db);
      const promises = defaultCollections.map(async (collection) => {
        try {
          await offloadToCollection(
            sourceDBObj,
            collection,
            targetDB || db,
            cutoffDate
          );
        } catch (error) {
          failedCollections.push(collection);
          errors.push(error);
        }
      });
      await Promise.all(promises);

      if (failedCollections.length) {
        throw new Error(
          `failed to offload from collections: ${failedCollections.join(
            ", "
          )}. ${errors.join(", ")}`
        );
      }
    } finally {
      client.close();
    }
  },
});

module.exports = command;
