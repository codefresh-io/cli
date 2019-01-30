const CFError = require('cf-errors'); // eslint-disable-line
const Entity = require('../../logic/entities/Entity');
const _ = require('lodash');
const columnify = require('columnify');
const moment = require('moment');

const { Formatter } = require('../../output/Formatter');
const { FormatterRegistry } = require('../../output/formatters');
const Style = require('../../output/Style');

const CliConfigManager = require('../../logic/cli-config/Manager');

const NO_RESOURCES_MESSAGE = 'no available resources';
const STYLED_NO_RESOURCES_MESSAGE = Style.yellow.prependedBy(Style.red('▸'))(NO_RESOURCES_MESSAGE);
const NOOP_FORMATTER = new Formatter();

const prettyOpts = {
    headingTransform: Style.bold,
    columnSplitter: '  ',
    preserveNewLines: true,
};

function _makeColumns(entities, pretty) {
    const keys = Object.keys(entities[0]);
    const res = [];
    let obj = [];
    _.forEach(entities, (row) => {
        obj = [];
        _.forEach(keys, (key) => {
            obj[key.toUpperCase()] = row[key];
        });
        res.push(obj);
    });
    return columnify(res, pretty ? prettyOpts : {});
}

function output(data, argv) {
    const config = CliConfigManager.config();
    const {
        pretty = config.output.pretty,
        output,
        selectColumns,
        dateFormat = config.output.dateFormat,
    } = argv;

    if (!data || data.length === 0) {
        return pretty ? STYLED_NO_RESOURCES_MESSAGE : NO_RESOURCES_MESSAGE;
    }

    let entities = _.isArray(data) ? data : [data];
    _.forEach(entities, (entity) => {
        if (!(entity instanceof Entity)) {
            throw new CFError('Cannot extract data for "table" output -- data contains not Entity');
        }
    });

    entities = entities.map((entity) => {
        let info = output === 'wide' ? entity.toWide() : entity.toDefault();

        if (!_.isEmpty(selectColumns)) {
            info = _.pick(info, selectColumns);
        }

        if (dateFormat && dateFormat !== 'default') {
            let dateFormatter;
            switch (dateFormat) {
                case 'date':
                    dateFormatter = Style.date;
                    break;
                case 'datetime':
                    dateFormatter = Style.datetime;
                    break;
                case 'date-diff':
                    dateFormatter = Style.dateDiff;
                    break;
                default:
                    dateFormatter = input => input instanceof Date ? moment(input)
                        .format(dateFormat) : input;
            }

            info = _.mapValues(info, dateFormatter);
        }


        // if no pretty flag and no dateFormat - force apply specific entity date format
        if (!pretty && (!dateFormat || dateFormat === 'default')) {
            const formatter = FormatterRegistry.get(entities[0].constructor.name);
            _.keys(info).forEach((key) => {
                const prop = info[key];
                if (prop instanceof Date) {
                    info[key] = formatter.applyStyles(key, prop);
                }
            });
        }

        if (pretty) {
            const formatter = FormatterRegistry.get(entities[0].constructor.name);
            info = formatter.apply(info);
        }

        return info;
    });

    return _makeColumns(entities, pretty);
}

module.exports = output;
