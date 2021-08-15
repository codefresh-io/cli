const { MongoClient, ObjectId } = require("mongodb");
const moment = require('moment')
const Command = require('../../Command');
const cmd = require('./base.cmd');
const { objectIdFromDate, defaultCollections } = require('./utils')

const offloadToCollection = async function(sourceDBObj, collection, targetDB, cutoffDate) {
  const sourceCollectionObj = sourceDBObj.collection(collection)
  const targetCollection = `archive-${collection}`
  
  const cutoffDateObj = moment(cutoffDate)
                        .add(1, 'days')
                        .startOf("day")

  if(!cutoffDateObj.isValid()){
    throw new Error('please enter a valid date in ISO 8601 format')
  }

  const cutoffDateId = objectIdFromDate(cutoffDateObj.toDate())

  var result = sourceCollectionObj.aggregate([
      { $match: { _id: { $lte: ObjectId(cutoffDateId) } } },
      { $merge: {
          into: {db: targetDB, coll: targetCollection},
          on: "_id",
          whenMatched: "keepExisting",
          whenNotMatched: "insert"
      }}
  ])

  await result.toArray()

  if (!result.cursorState.killed){
    console.info(`logs from '${collection}' were archived to '${targetCollection}'`)
    await sourceCollectionObj.deleteMany({_id: {$lte: ObjectId(cutoffDateId)}})
  }
  else {
      console.error("Cursor error. Archiving operation may not be completed.")
      console.error("The old logs were not deleted from the source collection.")
  }
}

const command = new Command({
    command: 'offload-to-collection',
    parent: cmd,
    description: 'Archiving logs from one or more source collections to target collections.',
    webDocs: {
        category: 'Logs',
        title: 'Offload To Collection',
    },
    builder: yargs => yargs
    .option('targetDB', {
          alias: 'tdb',
          describe: "Target database name, if none inserted, db will be defined as target.",
          type: "string",
        })
    .option('cutoffDate', {
      alias: "cod",
      describe:
        "The date in ISO format (yyyy-MM-dd) from which logs will be archived (going backwards, including logs from that day).",
      demandOption: true,
      type: "string",
    })
    .example('codefresh offline-logs offload-to-collection --uri "mongodb://192.168.99.100:27017" --db logs --c logs foo --cod "2021-07-08" '),
    handler: async (argv) => {
      const {
        uri,
        db,
        targetDB,
        cutoffDate,
      } = argv

      const client = new MongoClient(uri);
      try{
        await client.connect()
        const failedCollections = [];
        const sourceDBObj = client.db(db);
        const promises = defaultCollections.map( async (collection) => {
          try{
            await offloadToCollection(sourceDBObj, collection, targetDB || db, cutoffDate);
          } catch (error) {
            failedCollections.push(collection)
          }
        })
        await Promise.all(promises)

        if (failedCollections.length){
          throw new Error(`failed to offload from collections: ${failedCollections.join(', ')}`)
        }
      } finally {
          client.close();
      }
    },
})

module.exports = command;