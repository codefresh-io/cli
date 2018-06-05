const
    _ = require('lodash'),
    fp = require('lodash/fp'),
    moment = require('moment'),
    Command = require('../../../Command'),
    listToken = require('../../../../../logic/api/token').listToken,
    yaml = require('js-yaml'),
    columnify = require('columnify'),
    get = require('../../root/get.cmd');

const formatters = {
    json: _.partialRight(JSON.stringify, null, '\t'),
    name: (data) => _.map(data, _.property('name')).join('\n'),
    id: () => { throw (new Error('Unsupported output type "id"')); },
    wide: columnify,
    yaml: fp.pipe((arr) => (arr.length > 1 ? { items: arr } : arr), yaml.safeDump),
};

module.exports = new Command({
    root: true,
    command: 'token [name]',
    description: 'Retrieves a list of tokens',
    parent: get,
    handler({ output = "wide", name }){
        return listToken()
            .then(fp.pipe(
                fp.map(({ tokenPrefix, created, name = "N/A" }) => ({ token: _.padEnd(tokenPrefix, 21, '*'), created: moment(created).fromNow(), name })),
                name ? fp.filter({ name }) : _.identity,
                formatters[output],
                console.log,
            ), console.warn);
    },
});
