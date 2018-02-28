const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { pipeline } = require('../../../../logic').api;
const { specifyOutputForSingle, specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'pipelines [name]',
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
        const {name, output} = argv;
        const limit = argv.limit;
        const offset = (argv.page - 1) * limit;
        const nameRegex = argv['name-regex'];

        if (name) {
            specifyOutputForSingle(output, await pipeline.getPipelineByName(name));
        } else {
            specifyOutputForArray(output, await pipeline.getAll({
                limit,
                offset,
                nameRegex,
            }));
        }
    },
});

module.exports = command;

