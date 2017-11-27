const debug           = require('debug')('codefresh:auth:get-contexts');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { auth }        = require('../../../../../logic');
const authManager     = auth.manager;
const Table           = require('cli-table');



const command = 'get-contexts';

const describe = 'get-contexts';

const builder = (yargs) => {
    return yargs
        .help();
};

const handler = (argv) => {
    const table = new Table({
        head: ['CURRENT', 'NAME', 'URL'],
        colWidths: [10, 50, 30],
    });

    const currentContext = authManager.getCurrentContext();
    const contexts = authManager.getAllContexts();
    _.forEach(contexts, (context) => {
        if (context === currentContext) {
            table.push(['*', context.getName(), context.getUrl()]);
        } else {
            table.push(['', context.getName(), context.getUrl()]);
        }
    });

    console.log(table.toString());
};

module.exports = {
    command,
    describe,
    builder,
    handler: wrapHandler(handler),
};
