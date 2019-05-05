const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const Output = require('../../../../output/Output');
const { sdk } = require('../../../../logic');
const Pipeline = require('../../../../logic/entities/Pipeline');

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
            .option('project-id', {
                describe: 'Filter pipelines by project id',
            })
            .option('project', {
                describe: 'Filter pipelines by project name',
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
        const { id: ids, name, d: decryptVariables, projectId, project: projectName } = argv;
        const limit = argv.limit;
        const offset = (argv.page - 1) * limit;
        const labels = prepareKeyValueFromCLIEnvOption(argv.label);

        debug(`decrypt: ${decryptVariables}`);
        if (!_.isEmpty(ids)) {
            const pipelines = [];
            for (const id of ids) {
                try {
                    const currPipeline = await sdk.pipelines.get({ name: id, decryptVariables });
                    pipelines.push(Pipeline.fromResponse(currPipeline));
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
            let _projectId = projectId;
            if (!projectId && projectName) {
                const project = await sdk.projects.getByName({ name: projectName })
                    .catch(e => Promise.reject(new CFError({
                        message: `Could not get project "${projectName}"`,
                        cause: e,
                    })));
                _projectId = project.id;
            }
            const pipelines = await sdk.pipelines.list({
                limit,
                offset,
                id: name,
                labels,
                projectId: _projectId,
            });
            Output.print(_.map(_.get(pipelines, 'docs'), Pipeline.fromResponse));
        }
    },
});

module.exports = command;

