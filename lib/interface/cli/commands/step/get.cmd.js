const debug = require('debug')('codefresh:cli:get:step');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const Output = require('../../../../output/Output');
const { sdk } = require('../../../../logic');
const StepType = require('../../../../logic/entities/StepType');
const StepTypeVersion = require('../../../../logic/entities/StepTypeVersion');

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'step-types [id..]',
    aliases: ['step-type'],
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
                describe: 'Filter by name pattern',
            })
            .option('free-text', {
                describe: 'Filter by multiple criteria: name, description, tags',
                alias: 'text',
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
            .option('stage', {
                describe: 'Filter by stage',
                choices: ['graduated', 'incubating'],
            })
            .option('official', {
                describe: 'Filter only official steps',
                boolean: true,
            })
            .option('public', {
                describe: 'Filter only public steps',
                boolean: true,
            })
            .option('private', {
                describe: 'Filter only private steps',
                boolean: true,
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('versions', {
                describe: 'Get only typed-step versions',
                default: false,
                boolean: true,
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
        const isPrivate = argv.private;
        const category = argv.category;
        const stage = argv.stage;
        const official = argv.official;
        const tag = argv.tag;
        const freeText = argv['free-text'];
        const onlyVersions = argv.versions;

        if (onlyVersions) {
            const res = await sdk.steps.getStepVersions({ name: ids[0] });
            Output.print(_.map(res, StepTypeVersion.fromResponse));
        } else if (!_.isEmpty(ids)) {
            const steps = [];
            for (const id of ids) {
                try {
                    const currStep = await sdk.steps.get({ name: id });
                    steps.push(StepType.fromResponse(currStep));
                } catch (err) {
                    if (steps.length) {
                        Output.print(steps);
                    }

                    debug(err.toString());
                    const message = err.toString().includes('not find') ? `Step-type '${id}' was not found.` : 'Error occurred';
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
                public: isPublic,
                private: isPrivate,
                category,
                stage,
                official,
                tag,
                freeText,
            });
            Output.print(_.map(_.get(steps, 'docs'), StepType.fromResponse));
        }
    },
});

module.exports = command;

