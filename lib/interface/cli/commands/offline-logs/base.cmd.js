const yargs = require('yargs');
const Command = require('../../Command');

const command = new Command({
    command: 'offline-logs',
    root: true,
    description: 'Manages offline logs',
    webDocs: {
        category: 'Logs category',
        subCategory: 'Logs sub category',
        title: 'Archives old logs to file or collection.',
    },
    builder: (yargs) => {
        // set options which are used in both sub-commands
        return yargs
        .option('uri', {
              describe: "Mongodb URI",
              demandOption: true,
              type: "string",
            })
        .option('db', {
          describe: "Database name",
          demandOption: true,
          type: "string",
            })
        .option('collections', {
          alias: "c",
          describe: "Source collections names",
          default: ["logs", "metadata"],
          array: true,
          type: "string",
        })
        .option('cutoffDate', {
          alias: "cod",
          describe:
            "The date in ISO format (yyyy-MM-dd) from which logs will be archived (going backwards, including logs from that day).",
          demandOption: true,
          type: "string",
        });
    },
    handler: () => {
        yargs.showHelp();
    },
});

module.exports = command;
