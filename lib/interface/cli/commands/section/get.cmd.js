const debug = require('debug')('codefresh:cli:create:pipelines2');
const Command = require('../../Command');
const CFError = require('cf-errors');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { section: sectionLogic } = require('../../../../logic').api;
const { prepareKeyValueFromCLIEnvOption, printError } = require('../../helpers/general');
const { specifyOutputForArray } = require('../../helpers/get');

const getRoot = require('../root/get.cmd');


const command = new Command({
    command: 'sections [id..]',
    aliases: ['section'],
    parent: getRoot,
    description: 'Get a specific section or an array of sections',
    webDocs: {
        category: 'Sections',
        title: 'Get Section',
    },
    builder: (yargs) => {
        return yargs
            .option('board-id', {
                describe: 'Board id',
                required: true,
            })
            .option('id', {
                describe: 'Section by id',
            })
            .option('name', {
                describe: 'Section by name',
            });
    },
    handler: async (argv) => {
        const { id, name, output, boardId } = argv;
        if (id) {
            try {
                const section = await sectionLogic.getSectionById(id);
                specifyOutputForArray(output, [section]);
            } catch (err) {
                debug(err.toString());
                const message = `Section '${id}' was not found`;
                throw new CFError({
                    cause: err,
                    message,
                });
            }
        } else if (name) {
            try {
                const section = await sectionLogic.getSectionByName(name);
                specifyOutputForArray(output, [section]);
            } catch (err) {
                debug(err.toString());
                const message = `Section '${name}' was not found`;
                throw new CFError({
                    cause: err,
                    message,
                });
            }
        } else {
            specifyOutputForArray(output, await sectionLogic.getAll({ boardId }));
        }
    },
});

module.exports = command;

