
const { MongoClient, ObjectId } = require("mongodb");
const moment = require('moment')
const Command = require('../../Command');
const cmd = require('./base.cmd');
const {objectIdFromDate, writeLogsToFile, checkRemnant, defaultCollections} = require('./utils');

const offloadToFile = async function(database, collection, chunkDuration, cutoffDate, path) {
  const collectionObj = database.collection(collection);

  if (chunkDuration <= 0){
    throw new Error('please enter a valid chunkDuration ( > 0)')
  }
  let chunkSize = chunkDuration

  // the cutoff date will be the start of the next day from user input (archive will include the given cutoff date)
  const cutoffDateObj = moment(cutoffDate, moment.ISO_8601, true)
    .add(1, 'days')
    .startOf("day");
  if(!cutoffDateObj.isValid()){
    throw new Error('please enter a valid date in ISO 8601 format')
  }
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
      .option('chunkDuration', {
        alias: "chdur",
        describe:
          "Chunk size in days, each chunk will be archived into a different file.",
        default: 1,
        type: "number",
      })
      .option('cutoffDate', {
        alias: "cod",
        describe:
          "The date in ISO format (yyyy-MM-dd) from which logs will be archived (going backwards, including logs from that day).",
        demandOption: true,
        type: "string",
      })
      .option('path', {
        describe: "Directory path to which archive files will be saved.",
        default: ".",
        type: "string",
      })
      .option('collections', {
        alias: 'c',
        describe: "Source collections names",
        default: defaultCollections,
        array: true,
        type: "string",
        coerce(arg) {
          for (const collection of arg) {
            if (!collection.includes('logs') && !collection.includes('metadata')) {
              throw new Error ('invalid collection name')
            }
            return arg
          } 
        }
      })
      .example('codefresh offline-logs offload-to-file --uri "mongodb://192.168.99.100:27017" --db logs --collections archive-logs --cod "2021-07-08" --chdur 3 --path "./" '),
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
