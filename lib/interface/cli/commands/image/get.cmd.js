const debug = require('debug')('codefresh:cli:create:context');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { prepareKeyValueFromCLIEnvOption } = require('../../helpers/general');
const { image } = require('../../../../logic').api;
const { specifyOutputForArray } = require('../../helpers/get');
const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'images [id]',
    description: 'Get images',
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'image id',
            })
            .option('limit', {
                describe: 'Limit amount of returned results',
                default: DEFAULTS.GET_LIMIT_RESULTS,
            })
            .option('all', {
                describe: 'Return images from all possible registries (by default only r.cfcr.io images will be returned)',
                default: false,
            })
            .option('label', {
                describe: 'Filter by a list of annotated labels',
                alias: 'l',
                default: [],
            })
            .option('sha', {
                describe: 'Filter by specific commit sha',
                alias: 's',
            })
            .option('image-name', {
                describe: 'Filter by specific image name',
                type: 'array',
            })
            .option('branch', {
                describe: 'Filter by specific branch',
                type: 'array',
            })
            .option('tag', {
                describe: 'Filter by specific tag',
                type: 'array',
            })
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            });
    },
    handler: async (argv) => {
        const imageId = argv.id;
        const labels = prepareKeyValueFromCLIEnvOption(argv.label);
        const sha = argv.sha;
        const limit = argv.limit;
        const type = argv.type;
        const branch = argv.branch;
        const tag = argv.tag;
        const allRegistries = argv.all;
        const offset = (argv.page - 1) * limit;
        const imageName = argv['image-name'];
        let filterRegistries;
        if (!allRegistries) {
            filterRegistries = DEFAULTS.CODEFRESH_REGISTRIES;
        }

        let images;
        // TODO:need to decide for one way for error handeling
        if (imageId) {
            images = await image.getImageById(imageId);
        } else {
            images = await image.getAll({
                labels,
                sha,
                limit,
                filterRegistries,
                type,
                branch,
                tag,
                imageName,
                offset,
            });
        }

        specifyOutputForArray(argv.output, images);
    },
});
getRoot.subCommand(command);


module.exports = command;
