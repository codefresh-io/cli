const yargs = require('yargs');
const Command = require('../../Command');
const path = require('path');
const fs = require('fs');

/**
 * yargs script generation file redone
 * */
function _generateCompletionScript(appPath, appName, completionCommand) {
    let script = fs.readFileSync(
        path.resolve(__dirname, 'completion.sh.hbs'),
        'utf-8',
    );
    const name = appName || path.basename(appPath);

    script = script.replace(/{{app_name}}/g, name);
    script = script.replace(/{{completion_command}}/g, completionCommand);
    return script.replace(/{{app_path}}/g, appPath);
}

const command = new Command({
    root: true,
    command: 'completion',
    description: 'Generate codefresh completion',
    usage: 'Prints completion script with specified or default path to executable and command alias',
    webDocs: {
        category: 'Completion',
        title: 'Codefresh Completion',
        description: 'Generate codefresh completion. See details on [usage](codefresh-completion)',
        weight: 30,
    },
    builder: (yargs) => {
        return yargs
            .option('executable', {
                alias: 'e',
                description: 'Name or path to your codefresh executable (default same as alias)',
            })
            .option('alias', {
                alias: 'a',
                description: 'Alias used for calling codefresh executable',
                default: 'codefresh',
            })
            .example('codefresh completion', 'Print completion script')
            .example('cf completion --alias cf', 'Print completion script for codefresh aliased as "cf"')
            .example('/some/path/codefresh completion --e /some/path/codefresh', 'Print completion script with specified path to codefresh executable');
    },
    handler: async (argv) => {
        const { executable, alias: appName } = argv;
        const appPath = executable || appName;
        const script = _generateCompletionScript(appPath, appName, 'completion');
        console.log(script);
    },
});

module.exports = command;
