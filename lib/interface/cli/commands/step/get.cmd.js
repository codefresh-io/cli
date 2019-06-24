const debug = require('debug')('codefresh:cli:get:step');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const Output = require('../../../../output/Output');
const { sdk } = require('../../../../logic');
const Step = require('../../../../logic/entities/Step');

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'steps [id..]',
    aliases: ['step'],
    parent: getRoot,
    description: 'Get a specific step or an array of steps',
    webDocs: {
        category: 'Steps',
        title: 'Get Step',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Step name/id',
            })
            .option('name', {
                describe: 'Filter by name',
            })
            .option('tag', {
                describe: 'Filter by a tag',
                alias: 't',
                default: [],
            })
            .option('category', {
                describe: 'Filter by category',
                alias: 'c',
                default: [],
            })
            .option('graduation_stage', {
                describe: 'Filter by graduation stage',
                alias: 'g',
                choices: ['graduated', 'incubating']
            })
            .option('public', {
                describe: 'Filter only public steps',
                alias: 'p',
                boolean: true,
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
        const { id: ids, name } = argv;
        const limit = argv.limit;
        const offset = (argv.page - 1) * limit;
        const isPublic = argv.public;
        const category = argv.category;
        const graduationStage = argv['graduation_stage'];
        const tag = argv.tag;

        if (!_.isEmpty(ids)) {
            const steps = [];
            for (const id of ids) {
                try {
                    const currStep = await sdk.steps.get({ name: id });
                    steps.push(Step.fromResponse(currStep));
                } catch (err) {
                    if (steps.length) {
                        Output.print(steps);
                    }

                    debug(err.toString());
                    const message = err.toString().includes('not find') ? `Step '${id}' was not found.` : 'Error occurred';
                    throw new CFError({
                        cause: err,
                        message,
                    });
                }
            }
            Output.print(steps);
        } else {
            const steps = await sdk.steps.list({
                limit,
                offset,
                id: name,
                isPublic,
                category,
                graduationStage,
                tag
            });
            Output.print(_.map(_.get(steps, 'docs'), Step.fromResponse));
        }
    },
});

module.exports = command;

