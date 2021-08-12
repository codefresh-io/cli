
const { MongoClient, ObjectId } = require("mongodb");
const moment = require('moment')
const Command = require('../../Command');
const cmd = require('./base.cmd');
const {objectIdFromDate, writeLogsToFile, checkRemnant} = require('./utils')
const { boolean } = require("yargs");

const offloadToFile = async function(database, collection, chunkDuration, cutoffDate, path) {
  const collectionObj = database.collection(collection);
  let chunkSize = chunkDuration

  // the cutoff date will be the start of the next day from user input (archive will include the given cutoff date)
  const cutoffDateObj = moment(cutoffDate)
    .add(1, 'days')
    .startOf("day");
  const cutoffDateId = objectIdFromDate(cutoffDateObj.toDate())

  const minLog = await collectionObj
    .find({ _id: { $lt: ObjectId(cutoffDateId) } })
    .sort({ _id: 1 })
    .limit(1)
    .toArray();
  
  if (minLog.length === 0) {
      console.info(`No logs to archive in Collection ${collection} from the given date.`);
      return;
  }
  
  const minLogId = ObjectId(minLog[0]._id)
  const minDate = moment(
    minLogId.getTimestamp()
  ).startOf("day").toDate();

  for (
    let lowerBound = moment(minDate);
    lowerBound < cutoffDateObj;
    lowerBound.add( chunkSize, 'days' )
  ) {
    //in case total days period is not devided with chunkSize, the last chunk size needs to be smaller.
    const remnant = checkRemnant(lowerBound, cutoffDateObj)

    if (remnant < chunkSize && remnant > 0) {
      chunkSize = remnant;
    }
    const upperBound = moment(lowerBound).add( chunkSize, 'days' );

    const lowerBoundId = objectIdFromDate(lowerBound.toDate())
    const upperBoundId = objectIdFromDate(upperBound.toDate())
      
    const logsToArchive = await collectionObj
      .find({
        _id: {
          $gte: ObjectId(lowerBoundId),
          $lt: ObjectId(upperBoundId),
        },
      })
      .toArray();

    if (logsToArchive.length > 0) {
      writeLogsToFile(upperBound, lowerBound, collection, logsToArchive, path)

      await collectionObj.deleteMany({
        _id: {
          $gte: ObjectId(lowerBoundId),
          $lt: ObjectId(upperBoundId),
        },
      });
    }
  }
}

const command = new Command({
    command: 'offload-to-file',
    parent: cmd,
    description: 'Archiving logs from one or more source collections to files by chunks of days.',
    webDocs: {
        category: 'Logs',
        title: 'Offload To File',
    },
    builder: yargs => yargs
    .options({
      chunkDuration: {
        alias: "chdur",
        describe:
          "Chunk size in days, each chunk will be archived into a different file.",
        default: 1,
        type: "number",
      },
      path: {
        describe: "Directory path to which archive files will be saved.",
        default: ".",
        type: "string",
      },
    })
        .example('codefresh offline-logs offload-to-file --uri "mongodb://192.168.99.100:27017" --db logs --collections logs foo --cod "2021-07-08" --chdur 3 --path "./" '),
    handler: async (argv) => {
      const {
        uri,
        cutoffDate,
        chunkDuration,
        path,
        db,
        collections,
      } = argv;
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const failedCollections = [];
        const database = client.db(db);
        const promises = collections.map( async ( collection ) => {
          try {
            await offloadToFile( database, collection, chunkDuration, cutoffDate, path );
          } catch (e) {
            console.log(e)
            failedCollections.push(collection);
          }
        })
        await Promise.all(promises);

        if (failedCollections.length) {
          throw new Error(`failed to offload from collections: ${failedCollections.join(', ')}`)
        }
      } finally {
        client.close();
      }
    },
});

module.exports = command;
