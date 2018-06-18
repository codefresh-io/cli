const _ = require('lodash');
const columnify = require('columnify');
const { auth } = require('../../../logic');
const authManager = auth.manager;
const kefir = require('kefir');
const assert = require('assert');
const debug = require('debug')('codefresh:cli:helpers:auth');
const colors = require('colors');

const printTableForAuthContexts = ({ filter = 'all' }) => {
    const currentContext = authManager.getCurrentContext();
    if (!currentContext) {
        console.log('No authentication contexts. Please create an authentication context (see codefresh auth create-context --help)');
        return;
    }

    let contexts;
    if (filter === 'all') {
        contexts = _.keys(authManager.getAllContexts());
    }
    if (filter === 'current') {
        contexts = [_.get(authManager.getCurrentContext(), 'name', {})];
    }


    const res = [];
    let mergedKeys = [];
    let contextsInfo = {};
    return kefir.sequentially(0, contexts)
        .flatMap((contextName) => {
            let context = authManager.getContextByName(contextName);
            debug(`context to check ${context.name}`);
            return kefir.fromPromise(context.addAccountInfo()
                .then(() => {
                    mergedKeys = _.union(mergedKeys, context.defaultColumns);
                    let ret = _.chain(context)
                        .pick(context.defaultColumns)
                        .mapValues((value, key) => {
                            if (key === 'current') return '*'.green;
                            return _.isString(value) ? value : JSON.stringify(value);
                        })
                        .value();

                    return ret;
                }));
        })
        .scan((prev, context) => {
            prev.push(context);
            return prev;
        }, [])
        .flatMap((info) => {
            info = _.sortBy(info, ['name']);
            output = columnify(info, { columns: mergedKeys });
            return kefir.constant(output);
        })
        .ignoreErrors()
        .toPromise()
        .then((output) => {
            console.log(output);
        });

};

module.exports = { printTableForAuthContexts };
