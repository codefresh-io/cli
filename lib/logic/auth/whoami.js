const { sendHttpRequest } = require('../api/helper');
const _ = require('lodash');
const debug = require('debug')('codefresh:logic:auth:whoami');
const authManager = require('./manager');

const whoami = async (c) => {
    let context = c;

    if (_.isUndefined(context)) { context = authManager.getCurrentContext(); }

    debug(`context is ${context} for ${context.name}`);
    const userOptions = {
        url: '/api/user/',
        method: 'GET',
    };
    const user = await sendHttpRequest(userOptions, context);
    const accounts = _.get(user, 'account', {});
    const accountInfo = _.chain(accounts)
        .filter(account => account.name === user.activeAccountName)
        .get('[0]', {})
        .pick('name', 'runtimeEnvironment')
        .value();

    debug(`account info ${JSON.stringify(accountInfo)}`);
    debug(`current account name is : ${JSON.stringify(_.get(user, 'activeAccountName'))}`);

    return accountInfo;
};

module.exports = { whoami };
