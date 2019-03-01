const _ = require('lodash');
const columnify = require('columnify');
const chalk = require('chalk');
const kefir = require('kefir');
const debug = require('debug')('codefresh:cli:helpers:auth');
const { Config } = require('codefresh-sdk');
const { sdk } = require('../../../logic');

const printTableForAuthContexts = ({ filter = 'all' } = {}) => {
    const configManager = Config.manager();
    const currentContext = configManager.getCurrentContext();
    const sdkContext = sdk.config && sdk.config.context;
    if (!currentContext && (!sdkContext || sdkContext.isNoAuth)) {
        console.log('No authentication contexts. Please create an authentication context (see codefresh auth create-context --help)');
        return Promise.resolve();
    }

    let contexts;
    if (!currentContext || currentContext.name !== sdkContext.name) {
        console.log('Using authentication context created from CF_API_KEY env variable:');
        sdkContext.current = true;
        contexts = [sdkContext];
    } else if (filter === 'all') {
        contexts = _.values(configManager.getAllContexts());
    } else if (filter === 'current') {
        contexts = currentContext ? [currentContext] : [];
    }


    let mergedKeys = [];
    return kefir.sequentially(0, contexts)
        .flatMap((context) => {
            debug(`context to check ${context.name}`);
            return kefir.fromPromise(context.addAccountInfo()
                .then(() => {
                    mergedKeys = _.union(mergedKeys, context.defaultColumns);
                    return _.chain(context)
                        .pick(context.defaultColumns)
                        .mapValues((value, key) => {
                            if (key === 'current') return chalk.green('*');
                            return _.isString(value) ? value : JSON.stringify(value);
                        })
                        .value();
                }));
        })
        .scan((prev, context) => {
            prev.push(context);
            return prev;
        }, [])
        .flatMap((info) => {
            info = _.sortBy(info, ['name']); // eslint-disable-line
            const output = columnify(info, { columns: mergedKeys });
            return kefir.constant(output);
        })
        .ignoreErrors()
        .toPromise()
        .then((output) => {
            console.log(output);
        });
};

module.exports = { printTableForAuthContexts };
