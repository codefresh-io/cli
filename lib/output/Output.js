const _ = require('lodash');
const draftlog = require('draftlog');
const moment = require('moment');
const CFError = require('cf-errors'); // eslint-disable-line


const TYPES = {
    json: require('./types/json.output'),
    yaml: require('./types/yaml.output'),
    table: require('./types/table.output'),
    id: require('./types/id.output'),
    name: require('./types/name.output'),
};

const TABLE_TYPES = ['default', 'wide'];

let ARGV = {};


draftlog.into(console);

let update;

const _print = (output) => {
    if (update) {
        update(output);
    } else {
        update = console.draft(output);
    }
};


class Output {
    static init(argv) {
        ARGV = argv || {};

        const { dateFormat } = argv;
        if (dateFormat && dateFormat !== 'default') {
            try {
                moment(new Date()).format(dateFormat);
            } catch (e) {
                throw new CFError({
                    message: `Wrong date format provided: ${dateFormat}`,
                    cause: e,
                });
            }
        }
    }

    static print(data) {
        const { output = 'default' } = ARGV;
        const outputType = TABLE_TYPES.includes(output) ? 'table' : output;

        const outputter = TYPES[outputType] || _.toString;

        _print(outputter(data, ARGV));
    }
}

module.exports = Output;
