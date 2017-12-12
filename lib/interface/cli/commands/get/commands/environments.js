const debug           = require('debug')('codefresh:cli:create:context');
const CFError         = require('cf-errors');
const _               = require('lodash');
const { wrapHandler } = require('../../../helper');
const { environment } = require('../../../../../logic').api;
const { specifyOutputForSingle , specifyOutputForArray } = require('../helper');


const command = 'environments [id]';

const builder = (yargs) => {
    return yargs
        .positional('id', {
            describe: 'environment id',
        });
};

const handler = async (argv) => {
    const environmentId = argv.id;

    let environments;
    // TODO:need to decide for one way for error handeling
    if (environmentId) {
        environments = await environment.getEnvironmentById(environmentId);
        specifyOutputForSingle(argv.output, environments);
    } else {
        environments = await environment.getEnvironments();
        specifyOutputForArray(argv.output, environments);
    }
};

module.exports = {
    command,
    builder,
    handler: wrapHandler(handler),
};
