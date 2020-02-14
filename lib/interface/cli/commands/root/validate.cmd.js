const Command = require('../../Command');
const _ = require('lodash');
const Style = require('../../../../output/Style');
const path = require('path');
const { validatePipelineYaml } = require('../../helpers/validation');
const { pathExists, watchFile } = require('../../helpers/general');

const VALID_MESSAGE = Style.green('Yaml is valid!');

function _getResultMessage(result = {}) {
    if (result.warning) {
        return result.valid
            ? `${Style.yellow(result.warning)}`
            : `${Style.red(result.message)}\n${Style.yellow(result.warning)}\n`;
    }
    return result.valid
        ? VALID_MESSAGE
        : `${Style.red(result.message)}\n`;
}

function printResult(result) {
    console.log(_getResultMessage(result));
}

function _handleResult(result = {}, attach) {
    if (result.valid || attach) {
        return printResult(result);
    }
    throw Error(_getResultMessage(result));
}

const validateCmd = new Command({
    root: true,
    command: 'validate [filenames..]',
    description: 'Validate codefresh pipeline yaml config files.',
    usage: 'Validate one or many pipeline yaml files or attach validator to one and validate on changes',
    webDocs: {
        description: 'Validate codefresh pipeline yaml config files',
        category: 'Validation',
        title: 'Validate pipeline yaml',
        weight: 100,
    },
    builder: (yargs) => {
        yargs
            .positional('filenames', {
                describe: 'Paths to yaml files',
                required: true,
            })
            .option('attach', {
                alias: 'a',
                describe: 'Attach validator to the file and validate on change',
            });


        return yargs;
    },
    handler: async (argv) => {
        let { filenames, attach } = argv;
        filenames = filenames.map(f => path.resolve(process.cwd(), f));

        if (_.isEmpty(filenames)) {
            return console.log('No filename provided!');
        }

        const checkPromises = filenames.map(filename => pathExists(filename)
            .then((exists) => {
                if (!exists) {
                    console.log(`File does not exist: ${filename}`);
                }
                return exists;
            }));
        const allExist = (await Promise.all(checkPromises)).reduce((a, b) => a && b);

        if (!allExist) {
            return;
        }

        if (filenames.length > 1) {
            if (attach) {
                console.log('Cannot watch many files!');
                return;
            }

            filenames.forEach(f => validatePipelineYaml(f)
                .then((result) => {
                    console.log(`Validation result for ${f}:`);
                    printResult(result);
                }));
            return;
        }

        const filename = filenames[0];
        if (attach) {
            console.log(`Validator attached to file: ${filename}`);
            watchFile(filename, async () => {
                console.log('File changed');
                const result = await validatePipelineYaml(filename);
                printResult(result);
            });
        }

        // even with --attach option validates file for first time
        const result = await validatePipelineYaml(filename);
        _handleResult(result, attach);
    },
});

module.exports = validateCmd;
validateCmd.printResult = printResult;
