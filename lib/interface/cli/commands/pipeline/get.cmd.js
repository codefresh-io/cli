const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { pipeline } = require('../../../../logic').api;
const { prepareKeyValueFromCLIEnvOption, printError } = require('../../helpers/general');
const { specifyOutputForArray } = require('../../helpers/get');

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'pipelines [name..]',
    aliases: ['pip', 'pipeline'],
    parent: getRoot,
    description: 'Get a specific pipeline or an array of pipelines',
    webDocs: {
        category: 'Pipelines',
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
        const {name: names, output} = argv;
        const limit = argv.limit;
        const offset = (argv.page - 1) * limit;
        const nameRegex = argv['name-regex'];
        const labels = prepareKeyValueFromCLIEnvOption(argv.label);


        const pipelines = [];
        if (!_.isEmpty(names)) {
            for (const name of names) {
                try {
                    const currPipeline = await pipeline.getPipelineByName(name);
                    pipelines.push(currPipeline);
                } catch (err) {
                    const message = err.toString()
                        .includes('404') ? `Pipeline '${name}' was not found.` : 'Error occurred';
                    throw new CFError({
                        cause: err,
                        message,
                    });
                }
            }
            specifyOutputForArray(output, pipelines);
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

