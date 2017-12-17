const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { context }     = require('../../../../../logic').api;
const Table           = require('cli-table');


const command = 'contexts';

const builder = (yargs) => {
    return yargs
        .option('type', {
            describe: 'Specific type of context',
            choices: ['config', 'secret', 'helm-repository'],
        })
        .option('owner', {
            describe: 'Owner of the context',
            choices: ['user', 'account'],
        });
};

const handler = async (argv) => {
    const data = {};
    if (argv.type) {
        data.type = argv.type;
    }
    if (argv.owner) {
        data.owner = argv.owner;
    }

    const contexts = await context.getContexts(data);

    const table = new Table({
        head: ['NAME', 'TYPE'],
        colWidths: [50, 50],
    });

    _.forEach(contexts, (context) => {
        table.push([context.metadata.name, context.spec.type]);
    });

    console.log(table.toString());
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
