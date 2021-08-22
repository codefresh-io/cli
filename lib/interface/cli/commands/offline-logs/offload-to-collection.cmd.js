const { MongoClient, ObjectId } = require("mongodb");
const moment = require("moment");
const Command = require("../../Command");
const cmd = require("./base.cmd");
const {
  objectIdFromDate,
  defaultCollections,
  compareVersions,
  collectionExists,
  findMinLog,
} = require("./utils");

const offloadToCollection = async function (
  sourceDBObj,
  collection,
  targetDB,
  cutoffDate
) {
  const sourceCollectionObj = sourceDBObj.collection(collection);
  const targetCollection = `archive-${collection}`;

  const cutoffDateObj = moment(cutoffDate).add(1, "days").startOf("day");

  if (!cutoffDateObj.isValid()) {
    throw new Error("please enter a valid date in ISO 8601 format");
  }

  const cutoffDateId = objectIdFromDate(cutoffDateObj.toDate());

  const mongoInfo = await sourceDBObj.admin().serverInfo();
  const mongoServerVersion = await mongoInfo.version;
  const mergeReleaseVersion = "4.2.0";

  if (compareVersions(mergeReleaseVersion, mongoServerVersion) <= 0) {
    await archiveWithMerge(
      sourceCollectionObj,
      cutoffDateId,
      targetDB,
      targetCollection,
      collection
    );
  } else {
    if (await collectionExists(sourceDBObj, targetCollection)) {
      await archiveInChunks(
        sourceDBObj,
        sourceCollectionObj,
        targetCollection,
        cutoffDateId,
        collection,
        cutoffDateObj
      );
    } else {
      await archiveWithOut(
        sourceCollectionObj,
        cutoffDateId,
        targetCollection,
        collection
      );
    }
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
  const minLog = await findMinLog(
    sourceCollectionObj,
    cutoffDateId,
    collection
  );

  if (!minLog) {
    console.info(
      `No logs to archive in Collection ${collection} from the given date.`
    );
    return;
  }

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

  if (!result.cursorState.killed) {
    console.info(
      `logs from '${collection}' were archived to '${targetCollection}'`
    );
    await sourceCollectionObj.deleteMany({
      _id: { $lte: ObjectId(cutoffDateId) },
    });
  } else {
    throw new Error(
      "Cursor error. Archiving operation may not be completed.\
    The old logs were not deleted from the source collection."
    );
  }
};
///////////////////////////////////////////////////////////////////////////////////
const archiveWithOut = async function (
  sourceCollectionObj,
  cutoffDateId,
  targetCollection,
  collection
) {
  const minLog = await findMinLog(
    sourceCollectionObj,
    cutoffDateId,
    collection
  );

  if (!minLog) {
    console.info(
      `No logs to archive in Collection ${collection} from the given date.`
    );
    return;
  }

  var result = sourceCollectionObj.aggregate([
    { $match: { _id: { $lte: ObjectId(cutoffDateId) } } },
    { $out: targetCollection },
  ]);

  await result.toArray();

  if (!result.cursorState.killed) {
    console.info(
      `logs from '${collection}' were archived to '${targetCollection}'`
    );
    await sourceCollectionObj.deleteMany({
      _id: { $lte: ObjectId(cutoffDateId) },
    });
  } else {
    throw new Error(
      "Cursor error. Archiving operation may not be completed.\
      The old logs were not deleted from the source collection."
    );
  }
};
///////////////////////////////////////////////////////////////////////////////////
const archiveInChunks = async function (
  sourceDBObj,
  sourceCollectionObj,
  targetCollection,
  cutoffDateId,
  collection,
  cutoffDateObj
) {
  const targetCollectionObj = sourceDBObj.collection(targetCollection);
  const chunkSize = 1;
  const minLog = await findMinLog(
    sourceCollectionObj,
    cutoffDateId,
    collection
  );

  if (!minLog) {
    console.info(
      `No logs to archive in Collection ${collection} from the given date.`
    );
    return;
  }

  const minLogId = ObjectId(minLog._id);
  const minDate = moment(minLogId.getTimestamp()).startOf("day").toDate();

  for (
    let lowerBound = moment(minDate);
    lowerBound < cutoffDateObj;
    lowerBound.add(chunkSize, "days")
  ) {
    const upperBound = moment(lowerBound).add(chunkSize, "days");
    const lowerBoundId = objectIdFromDate(lowerBound.toDate());
    const upperBoundId = objectIdFromDate(upperBound.toDate());

    const logsToArchive = await sourceCollectionObj
      .find({
        _id: {
          $gte: ObjectId(lowerBoundId),
          $lt: ObjectId(upperBoundId),
        },
      })
      .toArray();

    if (logsToArchive.length > 0) {
      //clearify error handeling
      await targetCollectionObj.insertMany(logsToArchive);

      await sourceCollectionObj.deleteMany({
        _id: {
          $gte: ObjectId(lowerBoundId),
          $lt: ObjectId(upperBoundId),
        },
      });
    }
  }
  console.info(
    `logs from '${collection}' were archived to '${targetCollection}'`
  );
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
          `failed to offload from collections: ${failedCollections.join(", "
          )}. ${errors.join(", ")}`
        );
      }
    } finally {
      client.close();
    }
  },
});

module.exports = command;
