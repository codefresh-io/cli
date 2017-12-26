/* eslint-disable indent */
const _         = require('lodash');
const columnify = require('columnify');
const yaml      = require('js-yaml');
const logUpdate = require('log-update');

//i tried that this function will be dynamic (with the keys). it is also possible to add an array with all the fields if you think it better
const _printArrayTable = (data) => {
    if (data.length === 0) {
        throw ('no available resources');
    }
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
    const columns = columnify(res);
    logUpdate(columns);
};

const _printSingleTable = (info) => {
    const keys = Object.keys(info);
    const res  = [];
    const obj  = [];
    _.forEach(keys, (key) => {
        obj[key.toUpperCase()] = info[key];
    });
    res.push(obj);
    const columns = columnify(res);
    logUpdate(columns);
};


const specifyOutputForSingle = (type, enitity) => {
    logUpdate.clear();
    switch (type) {
        case 'json':
            logUpdate(enitity.toJson());
            break;
        case 'yaml':
            logUpdate(enitity.toYaml());
            break;
        case 'name':
            logUpdate(enitity.toName());
            break;
        case 'wide':
            _printSingleTable(enitity.toWide());
            break;
        default:
            _printSingleTable(enitity.toDefault());
    }
};


const specifyOutputForArray = (type, enitities) => {
    logUpdate.clear();
    switch (type) {
        case 'json':
            const jsonArray = [];
            _.forEach(enitities, (entity) => {
                jsonArray.push(entity.info);
            });
            logUpdate(JSON.stringify(jsonArray, null, '\t'));
            break;
        case 'yaml':
            let yamlArray = {
                items: [],
            };
            _.forEach(enitities, (entity) => {
                yamlArray.items.push(entity.info);
            });
            logUpdate(yaml.safeDump(yamlArray));
            break;
        case 'name':
            _.forEach(enitities, (entity) => {
                logUpdate(entity.toName());
            });
            break;
        case 'wide':
            const wideArray = [];
            _.forEach(enitities, (entity) => {
                wideArray.push(entity.toWide());
            });
            _printArrayTable(wideArray);
            break;
        default:
            const defaultArray = [];
            _.forEach(enitities, (entity) => {
                defaultArray.push(entity.toDefault());
            });
            _printArrayTable(defaultArray);
    }
};


module.exports = {
    specifyOutputForSingle,
    specifyOutputForArray,
};
