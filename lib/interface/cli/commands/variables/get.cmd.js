const Command = require('../../Command');
const CFError = require('cf-errors');
const { sdk } = require('../../../../logic');
const Project = require('../../../../logic/entities/Project');
const Output = require('../../../../output/Output');
const _ = require('lodash');
const DEFAULTS = require('../../defaults');
const { ignoreHttpError } = require('../../helpers/general');

const getRoot = require('../root/get.cmd');
const ExposedVariables = require('../../../../logic/entities/ExposedVariables');

const command = new Command({
    command: 'variables [id]',
    aliases: ['variables'],
    parent: getRoot,
    description: 'Get variables of specific build',
    webDocs: {
        category: 'Variables',
        title: 'Get Variables',
    },
    builder: yargs => yargs
        .positional('id', {
            describe: 'Build id  to get variables',
        }), 
    handler: async (argv) => {
        const { id, name, limit, page, tag: tags } = argv; // eslint-disable-line
        const offset = (page - 1) * limit;      
      
        const build = await sdk.workflows.getBuild({buildId:'637cd1dea0817d7ff9ebe406', noAccount:true}).catch(ignoreHttpError);
         
        if (_.isEmpty(build)) {
            throw new CFError('No build found');
        }
        for (const iterator in build.exposedVariables) {
            build.exposedVariables[iterator] = _.filter(build.exposedVariables[iterator], x => !_.isEmpty(x) && !_.isEmpty(x.value));                      
            if(_.isEmpty( _.compact(build.exposedVariables[iterator]))){
                delete build.exposedVariables[iterator];
            }            
        }      
        Output.print( ExposedVariables.fromResponse(build));
    },
});

module.exports = command;
