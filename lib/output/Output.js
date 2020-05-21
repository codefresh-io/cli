const _ = require('lodash');
const draftlog = require('draftlog');
const moment = require('moment');
const CFError = require('cf-errors');
const defaults = require('../../lib/interface/cli/defaults');

const isDebug = () => (process.env.DEBUG || '').includes(defaults.DEBUG_PATTERN);


const TYPES = {
    json: require('./types/json.output'),
    yaml: require('./types/yaml.output'),
    table: require('./types/table.output'),
    id: require('./types/id.output'),
    name: require('./types/name.output'),
};

const TABLE_TYPES = ['default', 'wide'];

let ARGV = {};

let update;
function watchPrint(str) {
    if (!update) {
        draftlog.into(console);
        update = console.draft(str);
    } else {
        update(str);
    }
}

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

        const message = outputter(data, ARGV);
        if (ARGV.watch) {
            watchPrint(message);
        } else {
            console.log(message);
        }
    }

    static printError(error) {
        if (isDebug()) {
            console.error(error.stack);
        } else {
            console.error(this._extractErrorMessage(error));
        }
    }

    static _extractErrorMessage(error) {
        if (_.isString(error.message)) {
            try {
                let json = JSON.parse(error.message);
                if (_.isString(json)) {
                    json = JSON.parse(json);
                }
                const message = json.message || error.message;
                return message ? `Error: ${message}` : error.toString();
            } catch (e) {
                return error.toString();
            }
        }
        return error.toString();
    }
}

module.exports = Output;
