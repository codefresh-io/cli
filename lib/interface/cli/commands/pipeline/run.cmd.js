const debug = require('debug')('codefresh:cli:run:pipeline');
const Command = require('../../Command');
const { crudFilenameOption } = require('../../helpers/general');
const RunLocalCommand = require('./run.local');
const RunExternalCommand = require('./run.cf');

function getCommandFlavor(argv) {
    if (argv.local) {
        return new RunLocalCommand(argv);
    }
    return new RunExternalCommand(argv);
}

const run = new Command({
    root: true,
    command: 'run [name]',
    description: 'Run a pipeline by id or name and attach the created workflow logs.',
    usage: 'Returns an exit code according to the workflow finish status (Success: 0, Error: 1, Terminated: 2)',
    webDocs: {
        category: 'Pipelines',
        title: 'Run Pipeline',
        weight: 50,
    },
    builder: (yargs) => {
        yargs
            .option('trigger', {
                describe: 'Trigger id or name',
                alias: 't',
            })
            .option('branch', {
                describe: 'Branch',
                alias: 'b',
            })
            .positional('name', {
                describe: 'Pipeline name',
            })
            .option('memory', {
                describe: 'Mention machine memory sizes during pipeline run',
                coerce: value => `${value}Mi`,
            })
            .option('cpu', {
                describe: 'Mention machine cpu sizes during pipeline run',
                coerce: value => `${value}m`,
            })
            .option('disk', {
                describe: 'Mention machine disk space sizes during pipeline run',
                coerce: value => `${value}Gi`,
            })
            .option('pack-name', {
                describe: 'Resources size (`small`, `medium` or `large`)',
                choices: ['small', 'medium', 'large'],
            })
            .option('runtime-name', {
                describe: 'Runtime environment for run pipeline',
            })
            .option('sha', {
                describe: 'Set commit sha',
                alias: 's',
            })
            .option('no-cache', {
                describe: 'Ignore cached images',
                alias: 'nc',
                default: false,
                type: 'boolean',
            })
            .option('annotation', {
                describe: 'Add annotations to created build',
                default: [],
                alias: 'a',

            })
            .option('enable-notifications', {
                describe: 'Report notifications about pipeline execution',
                alias: 'en',
                default: false,
                type: 'boolean',
            })
            .option('reset-volume', {
                describe: 'Reset pipeline cached volume',
                alias: 'rv',
                default: false,
                type: 'boolean',
            })
            .option('variable', {
                describe: 'Set build variables',
                default: [],
                alias: 'v',
            })
            .option('detach', {
                alias: 'd',
                describe: 'Run pipeline and print build ID',
            })
            .option('context', {
                alias: 'c',
                describe: 'Run pipeline with contexts',
                default: [],
                array: true,
            })
            .option('local', {
                describe: 'Run pipeline on your local docker machine',
                type: 'boolean',
                default: false,
            })
            .option('local-volume', {
                describe: 'Use your file system as volume in local run',
                alias: 'lv',
            })
            .option('no-cf-cache', {
                describe: 'Ignore Codefresh cache optimizations',
                alias: 'ncfc',
                default: false,
                type: 'boolean',
            })
            .option('only', {
                describe: 'run only specifc steps',
                array: true,
            })
            .option('skip', {
                describe: 'skip specifc steps',
                array: true,
            })
            .option('debug', {
                describe: 'debug mode',
            })
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME --trigger TRIGGER_ID | TRIGGER_NAME -b=master', 'Choosing a specific trigger')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master', 'Defining the source control context using a branch')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -s=52b992e783d2f84dd0123c70ac8623b4f0f938d1', 'Defining the source control context using a commit')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master -v key1=value1 -v key2=value2', 'Setting variables through the command')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master --var-file ./var_file.yml', 'Settings variables through a yml file')
            .example('codefresh run PIPELINE_ID | PIPELINE_NAME -b=master --context context', 'Inject contexts to the pipeline execution');

        crudFilenameOption(yargs, {
            name: 'variable-file',
            alias: 'var-file',
            describe: 'Set build variables from a file',
        });

        crudFilenameOption(yargs, {
            name: 'yaml',
            alias: 'y',
            raw: true,
            describe: 'Override codefresh.yaml for this execution',
        });

        return yargs;
    },
    handler: async (argv) => {
        const exitProcess = (argv && argv.exitProcess);
        const flavor = getCommandFlavor(argv);
        await flavor.preRunAll();
        const exitCode = await flavor.run();
        await flavor.postRunAll();
        if (exitProcess !== false) {
            process.exit(exitCode);
        }
    },
});

module.exports = run;
