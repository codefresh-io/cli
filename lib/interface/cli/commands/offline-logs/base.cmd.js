const yargs = require("yargs");
const Command = require("../../Command");

const command = new Command({
  command: "offline-logs",
  root: true,
  description: "Manages offline logs",
  webDocs: {
    category: "Logs category",
    subCategory: "Logs sub category",
    title: "Archives old logs to file or collection.",
  },
  builder: (yargs) => {
    // set options which are used in both sub-commands
    return yargs
      .env("RUNTIME_MONGO")
      .option("uri", {
        describe:
          "Mongodb URI. If not provided, will be parsed from environment variable RUNTIME_MONGO_URI.",
        type: "string",
      })
      .option("db", {
        describe:
          "Database name. If not provided, will be parsed from environment variable RUNTIME_MONGO_DB.",
        type: "string",
      });
  },
  handler: () => {
    yargs.showHelp();
  },
});

module.exports = command;
