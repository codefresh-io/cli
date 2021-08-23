const { MongoClient } = require("mongodb");
const Command = require("../../Command");
const cmd = require("./base.cmd");
const utils = require('./utils')

const command = new Command({
  command: "ensure-index",
  parent: cmd,
  description:
    "Checks whether a collection has indexes and gives the user an option to add them. Adding an index may improve performance of some of the read operations.",
  webDocs: {
    category: "Logs",
    title: "Ensures one or more offline-logs collections has indexes",
  },
  builder: (yargs) =>
    yargs.example(
      'codefresh offline-logs ensure-index --uri "mongodb://192.168.99.100:27017" --db logs'
    ),
  handler: async (argv) => {
    const { uri, db } = argv;
    const client = new MongoClient( uri, { useUnifiedTopology: true } );
    await client.connect();
    const database = client.db(db);
    const failedCollections = [];
    const errors = [];
    for (const collection of utils.defaultCollections) {
      try {
        await utils.ensureIndex(database, collection);
      } catch (error) {
        console.error(`failed to ensure index of collection '${collection}', error: ${error.message}`);
        failedCollections.push(collection);
        errors.push(error);
      }
    }
    client.close();
    if (failedCollections.length) {
      throw new Error(
        `failed to ensure indexes of ${failedCollections.join(', ')}, ${errors.join(', ')}`
      );
    }
  },
});

module.exports = command;
