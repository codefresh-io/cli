const yargs = require('yargs');
const tree = require('./tree');
const registerDynamicCompletions = require('./dynamic');
const _ = require('lodash');

function initCompletion() {
    registerDynamicCompletions(tree.codefresh);
    return yargs
        .completion('completion', (word, argv) => {
            let args = argv._.filter(a => !_.isEmpty(a));
            let commandPath = args.join('.');

            let result = _.get(tree, commandPath);
            let lastWord = '';

            // remove all positional or not ended last command
            while (!result && args.length) {
                lastWord = args[args.length - 1];
                args = args.slice(0, -1);
                commandPath = args.join('.');
                result = _.get(tree, commandPath);
            }

            // replace alias it with real (needed when completion executes function, for future dynamic completion)
            if (result && result.alias) {
                const realPath = `${args.slice(0, -1).join('.')}.${result.alias}`;
                result = _.get(tree, realPath);
            }

            if (_.isFunction(result)) {
                return result(word, argv);
            }
            if (_.isObject(result)) {
                return _.keys(result).filter(k => {
                    // filter being not alias (when having no last word) and by the last passed word
                    return (lastWord || !_.get(result, k).alias) && k.startsWith(lastWord);
                });
            }
            return [];
        })
        .argv;
}

module.exports = initCompletion;
