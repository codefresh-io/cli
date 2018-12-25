const yargs = require('yargs');
const _ = require('lodash');
const { authContextWrapper } = require('./helpers');

let tree;
try {
    tree = require('./tree'); // tree is generated at build phase
} catch (e) {
    // cannot do any log -- will be displayed as completion due to bash
    tree = {};
}

function initCompletion() {
    return yargs
        .completion('completion', async (word, argv) => {
            let args = argv._.filter(a => !_.isEmpty(a));
            if (!_.isEmpty(args)) {
                args[0] = 'codefresh'; // first arg is always executable name (can be any alias)
            }

            let commandPath = args.join('.');
            let result = _.get(tree, commandPath);
            let lastWord = '';

            // remove all positional or last word that not resolves any completion descendants
            while (!result && args.length) {
                lastWord = _.last(args);
                args = args.slice(0, -1);
                commandPath = args.join('.');
                result = _.get(tree, commandPath);
            }

            // when last word resolves completion descendants, check if it has no siblings from parent
            if (!_.isEmpty(word) && _.isEmpty(lastWord) && args.length && _.last(args) === word) {
                lastWord = word;
                args = args.slice(0, -1);
                commandPath = args.join('.');
                result = _.get(tree, commandPath);
            }

            // replace alias with its real (needed when completion executes function, for future dynamic completion)
            if (result && result.alias) {
                const realPath = `${args.slice(0, -1).join('.')}.${result.alias}`;
                result = _.get(tree, realPath);
            }

            if (result) {
                const pArgv = process.argv;
                const optionArg = pArgv.length > 2 ? pArgv[pArgv.length - 2] : null;
                if (optionArg && optionArg.startsWith('-')) {
                    if (result.__optionHandlers) {
                        try {
                            for (const handlerPath of result.__optionHandlers) {
                                const handler = require(handlerPath).optionHandler;
                                const completions = await handler({ word, argv, option: optionArg });
                                if (_.isArray(completions)) {
                                    return completions;
                                }
                            }
                            return [];
                        } catch (e) {
                            return [];
                        }
                    } else {
                        return [];
                    }
                }

                if (result.__positionalHandler) {
                    try {
                        const handler = require(result.__positionalHandler).positionalHandler;
                        return await handler({ word, argv });
                    } catch (e) {
                        return [];
                    }
                }
                if (_.isObject(result)) {
                    return _.keys(result).filter((k) => {
                        // do not display aliases on completion unless alias is entered fully
                        // and real command not starts with its alias (example: context and ctx)
                        const alias = _.get(result, k).alias;
                        return !k.startsWith('__') && ((alias && !alias.startsWith(k) && word === k) || (!alias && k.startsWith(lastWord)));
                    });
                }
            }
            return [];
        });
}

module.exports = initCompletion;
