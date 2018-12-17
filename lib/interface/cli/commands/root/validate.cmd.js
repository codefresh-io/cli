const Command = require('../../Command');
const _ = require('lodash');
const Style = require('../../../../output/style');
const path = require('path');
const { validatePipelineYaml } = require('../../helpers/validation');
const { pathExists, watchFile } = require('../../helpers/general');

const VALID_MESSAGE = Style.green('Yaml is valid!');

function _printResult(result) {
    console.log(result.valid ? VALID_MESSAGE : Style.red(result.message), '\n');
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
            console.log('No filename provided!');
            return;
        }

        const checkPromises = filenames.map((filename) => {
            return pathExists(filename)
                .then((exists) => {
                    if (!exists) {
                        console.log(`File does not exist: ${filename}`);
                    }
                    return exists;
                });
        });
        const allExist = (await Promise.all(checkPromises)).reduce((a, b) => a && b);

        if (!allExist) {
            return;
        }

        if (filenames.length > 1) {
            if (attach) {
                console.log('Cannot watch many files!');
                return;
            }

            filenames.forEach(f => validatePipelineYaml(f).then((result) => {
                console.log(`Validation result for ${f}:`);
                _printResult(result);
            }));
            return;
        }

        const filename = filenames[0];
        if (attach) {
            console.log(`Validator attached to file: ${filename}`);
            watchFile(filename, async () => {
                console.log('File changed');
                const result = await validatePipelineYaml(filename);
                _printResult(result);
            });
        }

        // even with --attach option validates file for first time
        const result = await validatePipelineYaml(filename);
        _printResult(result);
    },
});

module.exports = validateCmd;
