const
    _ = require('lodash'),
    fp = require('lodash/fp'),
    moment = require('moment'),
    Command = require('../../../Command'),
    listToken = require('../../../../../logic/api/token').listToken,
    columnify = require('columnify'),
    get = require('../../root/get.cmd');

module.exports = new Command({

    root: true,
    command: 'token',
    description: 'Retrieves a list of tokens',
    parent: get,
    handler(){
        return listToken()
            .then(fp.pipe(
                fp.map(({ tokenPrefix, created, name = "N/A" }) => ({ token: _.padEnd(tokenPrefix, 21, '*'), created: moment(created).fromNow(), name })),
                columnify,
                console.log,
            ), console.warn);
    },
});
