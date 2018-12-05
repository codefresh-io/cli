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
    command: 'images [id..]',
    aliases: ['img', 'image'],
    parent: getRoot,
    description: 'Get a specific image or an array of images',
    usage: 'Passing [id] argument will cause a retrieval of a specific image.\n In case of not passing [id] argument, a list will be returned',
    webDocs: {
        category: 'Images',
        title: 'Get Image',
    },
    builder: (yargs) => {
        return yargs
            .positional('id', {
                describe: 'Docker Image id',
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
            })
            .example('codefresh get image ID', 'Get image ID')
            .example('codefresh get images', 'Get all images')
            .example('codefresh get images --image-name node', "Get all images that their name contains the word 'node'")
            .example('codefresh get images -l key1=value1', "Get all images that are annotated with 'value1' for 'key1'");
    },
    handler: async (argv) => {
        const imageIds = argv.id;
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

        let images = [];
        // TODO:need to decide for one way for error handeling
        if (!_.isEmpty(imageIds)) {
            for (const id of imageIds) {
                const currImage = await image.getImageById({
                    id,
                    allRegistries,
                });
                _.forEach(currImage, (img) => {
                    images.push(img);
                });
            }
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
        specifyOutputForArray(argv.output, images, argv.pretty);
    },
});

module.exports = command;
