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
    aliases: ['img', 'image'],
    parent: getRoot,
    cliDocs: {
        description: 'Get a specific or an array of images',
    },
    webDocs: {
        category: 'Images',
        title: 'Get a single image',
    },
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
                alias: 'a',
                describe: 'Return images from all possible registries (by default only r.cfcr.io images will be returned)',
                default: false,
            })
            .option('label', {
                describe: 'Filter by a list of annotated labels',
                alias: 'l',
                default: [],
            })
            .option('tag', {
                describe: 'Filter by a list of tags',
                alias: 't',
                type: Array,
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
            .option('page', {
                describe: 'Paginated page',
                default: DEFAULTS.GET_PAGINATED_PAGE,
            });
    },
    handler: async (argv) => {
        const imageId = argv.id;
        const labels = prepareKeyValueFromCLIEnvOption(argv.label);
        const tags = argv.tag;
        const sha = argv.sha;
        const limit = argv.limit;
        const type = argv.type;
        const branch = argv.branch;
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
            images = await image.getImageById({
                imageId,
                allRegistries,
            });
        } else {
            images = await image.getAll({
                labels,
                tags,
                sha,
                limit,
                filterRegistries,
                type,
                branch,
                imageName,
                offset,
            });
        }

        specifyOutputForArray(argv.output, images);
    },
});

module.exports = command;
