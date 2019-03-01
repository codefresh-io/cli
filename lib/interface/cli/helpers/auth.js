const _ = require('lodash');
const columnify = require('columnify');
const kefir = require('kefir');
const debug = require('debug')('codefresh:cli:helpers:auth');
const { Config } = require('codefresh-sdk');
const { sdk } = require('../../../logic');

const printTableForAuthContexts = ({ filter = 'all' }) => {
    const configManager = Config.manager();
    const currentContext = configManager.getCurrentContext();
    const sdkContext = sdk.config && sdk.config.context;
    if (!currentContext && !sdkContext) {
        console.log('No authentication contexts. Please create an authentication context (see codefresh auth create-context --help)');
        return;
    }

    let contexts;
    if (currentContext.name !== sdkContext.name) {
        console.log('Using authentication context created from CF_API_KEY env variable:');
        sdkContext.current = true;
        contexts = [sdkContext];
    } else if (filter === 'all') {
        contexts = _.values(configManager.getAllContexts());
    } else if (filter === 'current') {
        const ctx = configManager.getCurrentContext();
        contexts = ctx ? [ctx] : [];
    }


    const res = [];
    let mergedKeys = [];
    let contextsInfo = {};
    return kefir.sequentially(0, contexts)
        .flatMap((context) => {
            // let context = configManager.getContextByName(contextName);
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
