const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { pipeline } = require('../../../../logic').api;
const { prepareKeyValueFromCLIEnvOption, printError } = require('../../helpers/general');
const Output = require('../../../../output/Output');

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'pipelines [id..]',
    aliases: ['pip', 'pipeline'],
    parent: getRoot,
    description: 'Get a specific pipeline or an array of pipelines',
    webDocs: {
        category: 'Pipelines',
        title: 'Get Pipeline',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Pipeline name/id',
            })
            .option('decrypt-variables', {
                alias: 'd',
                describe: 'Will decrypt encrypted variables',
            })
            .option('name', {
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
        const { id: ids, name, d: decryptVariables} = argv;
        const limit = argv.limit;
        const offset = (argv.page - 1) * limit;
        const labels = prepareKeyValueFromCLIEnvOption(argv.label);

        debug(`decrypt: ${decryptVariables}`);
        if (!_.isEmpty(ids)) {
            const pipelines = [];
            for (const id of ids) {
                try {
                    const currPipeline = await pipeline.getPipelineByName(id, { decryptVariables });
                    pipelines.push(currPipeline);
                } catch (err) {
                    if (pipelines.length) {
                        Output.print(pipelines);
                    }

                    debug(err.toString());
                    const message = err.toString().includes('not find') ? `Pipeline '${id}' was not found.` : 'Error occurred';
                    throw new CFError({
                        cause: err,
                        message,
                    });
                }
            }
            Output.print(pipelines);
        } else {
            const pipelines = await pipeline.getAll({
                limit,
                offset,
                name,
                labels,
            });
            Output.print(pipelines);
        }
    },
});

module.exports = command;

