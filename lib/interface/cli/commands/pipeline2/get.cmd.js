const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { pipeline2: pipeline } = require('../../../../logic').api;
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'pipelines-v2 [name..]',
    aliases: ['pip-v2', 'pipeline-v2'],
    parent: getRoot,
    description: 'Get a specific pipeline or an array of pipelines',
    webDocs: {
        category: 'Pipelines V2',
        title: 'Get Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('name', {
                describe: 'Pipeline name',
            })
            .option('name-regex', {
                describe: 'Filter pipelines by name',
            })
            .option('label', {
                describe: 'Filter by a label',
                alias: 'l',
                default: [],
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            });
    },
    handler: async (argv) => {
        const {names, output} = argv;
        const limit = argv.limit;
        const offset = (argv.page - 1) * limit;
        const nameRegex = argv['name-regex'];
        const labels = prepareKeyValueFromCLIEnvOption(argv.label);


        const pipelines = [];
        if (!_.isEmpty(names)) {
            for (const name of names) {
                const currPipeline = await pipeline.getPipelineByName(name);
                pipelines.push(currPipeline);
            }
        } else {
            specifyOutputForArray(output, await pipeline.getAll({
                limit,
                offset,
                nameRegex,
                labels,
            }));
        }
    },
});

module.exports = command;

