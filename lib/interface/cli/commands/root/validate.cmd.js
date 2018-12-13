const Command = require('../../Command');
const fs = require('fs');
const _ = require('lodash');
const Style = require('../../../../output/style');
const path = require('path');
const { validatePipelineYaml } = require('../../helpers/validation');
const { pathExists } = require('../../helpers/general');


const VALID_MESSAGE = Style.green('Yaml is valid!');
function _printResult(result) {
    console.log(result.valid ? VALID_MESSAGE : Style.red(result.message));
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
            console.log('No filename not provided!');
            return;
        }

        const allExist = (
            await Promise.all(filenames.map(f => pathExists(f)))
        ).reduce((a, b) => a && b);

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
                console.log();
            }));
            return;
        }

        const filename = filenames[0];
        if (attach) {
            console.log(`Validator attached to file: ${filename}`);
            fs.watchFile(filename, { interval: 500 }, async () => {
                console.log('File changed');
                const result = await validatePipelineYaml(filename);
                _printResult(result);
                console.log();
            });

            const unwatcher = f => () => fs.unwatchFile(f);
            ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType) => {
                process.on(eventType, unwatcher(filename));
            });
        }

        // even with --attach option validates file for first time
        const result = await validatePipelineYaml(filename);
        _printResult(result);
        console.log();
    },
});

module.exports = validateCmd;
