/* eslint-disable indent */
const _                     = require('lodash');
const columnify             = require('columnify');
const chalk                 = require('chalk');
const yaml                  = require('js-yaml');
const draftlog              = require('draftlog');
const { Formatter }         = require('../../../output');
const { FormatterRegistry } = require('../../../output/formatters');

const NOOP_FORMATTER = new Formatter();

const prettyOpts = {
    headingTransform: chalk.bold,
    columnSplitter: '  ',
};

draftlog.into(console);

let update;
const print = (output) => {
    if (update) {
        update(output);
    } else {
        update = console.draft(output);
    }
};

//i tried that this function will be dynamic (with the keys). it is also possible to add an array with all the fields if you think it better
const _printArrayTable = (data, pretty = false) => {
    if (data.length === 0) {
        console.log('no available resources');
    } else {
        const keys = Object.keys(data[0]);
        const res  = [];
        let obj    = [];
        _.forEach(data, (row) => {
            obj = [];
            _.forEach(keys, (key) => {
                obj[key.toUpperCase()] = row[key];
            });
            res.push(obj);
        });
        const columns = columnify(res, pretty ? prettyOpts : {});
        print(columns);
    }
};

const _printSingleTable = (info, pretty = false) => {
    const keys = Object.keys(info);
    const res  = [];
    const obj  = [];
    _.forEach(keys, (key) => {
        obj[key.toUpperCase()] = info[key];
    });
    res.push(obj);
    const columns = columnify(res, pretty ? prettyOpts : {});
    print(columns);
};


// todo: extract output layer from commands
const specifyOutputForSingle = (type, entity, pretty = false) => {
    let formatter = NOOP_FORMATTER;
    if (pretty && entity) {
        formatter = FormatterRegistry.get(entity.constructor.name);
    }
    switch (type) {
        case 'json':
            print(entity.toJson());
            break;
        case 'yaml':
            print(entity.toYaml());
            break;
        case 'name':
            print(entity.toName());
            break;
        case 'wide':
            _printSingleTable(formatter.apply(entity.toWide()), pretty);
            break;
        default:
            _printSingleTable(formatter.apply(entity.toDefault()), pretty);
    }
};


// todo: extract output layer from commands
const specifyOutputForArray = (type, entities, pretty = false) => {
    let formatter = NOOP_FORMATTER;
    if (pretty && entities.length) {
        formatter = FormatterRegistry.get(entities[0].constructor.name);
    }
    switch (type) {
        case 'json':
            const jsonArray = [];
            _.forEach(entities, (entity) => {
                jsonArray.push(entity.info);
            });

            if (jsonArray.length === 1) {
                print(JSON.stringify(jsonArray[0], null, '\t'));
            } else {
                print(JSON.stringify(jsonArray, null, '\t'));
            }

            break;
        case 'yaml':
            let yamlArray = {
                items: [],
            };
            _.forEach(entities, (entity) => {
                yamlArray.items.push(entity.info);
            });

            if (yamlArray.items.length === 1) {
                print(yaml.safeDump(yamlArray.items[0]));
            } else {
                print(yaml.safeDump(yamlArray));
            }
            break;
        case 'name':
            _.forEach(entities, (entity) => {
                console.log(entity.toName());
            });
            break;
        case 'id':
            _.forEach(entities, (entity) => {
                console.log(entity.toId());
            });
            break;
        case 'wide':
            const wideArray = [];
            _.forEach(entities, (entity) => {
                wideArray.push(formatter.apply(entity.toWide()));
            });
            _printArrayTable(wideArray, pretty);
            break;
        default:
            const defaultArray = [];
            _.forEach(entities, (entity) => {
                defaultArray.push(formatter.apply(entity.toDefault()));
            });
            _printArrayTable(defaultArray, pretty);
    }
};


module.exports = {
    specifyOutputForSingle,
    specifyOutputForArray,
};
