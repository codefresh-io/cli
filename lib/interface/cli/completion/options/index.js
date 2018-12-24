const _ = require('lodash');

/**
 * !!! HANDLERS MUST RETURN null IF THEY NOT SUPPORT PASSED OPTION
 * */
const COMPLETIONS = [
    require('./Filename.option'),
    require('./Output.option'),
];

function _setRecursively(obj, handlers) {
    if (!obj.alias) {
        const optionHandlers = obj.__optionHandlers || [];
        obj.__optionHandlers = _.concat(optionHandlers, handlers);
        _.keys(obj)
            .filter(key => !key.startsWith('__'))
            .forEach((key) => {
                _setRecursively(obj[key], handlers);
            });
    }
}

/**
 * Completions are set as plugins, so when a completion registers itself for "get" command,
 * it simply adds its handler to the "get" command option handlers list.
 *
 * Handlers are attached recursively to "get" command descendants.
 *
 * Also, handlers for same option are "overridden" by completion with more specific command path (more dots),
 * because they are sorted descending.
 *
 * */
function register(tree) {
    const collector = {};
    COMPLETIONS.forEach((completion) => {
        completion.paths.forEach((path) => {
            let optionHandlers = _.get(collector, path);
            if (!optionHandlers) {
                optionHandlers = [];
                collector[path] = optionHandlers;
            }
            optionHandlers.push(completion.handler);
        });
    });
    _.keys(collector)
        .sort((a, b) => { // paths with more dots first
            const aDots = a.split('.').length;
            const bDots = b.split('.').length;
            if (aDots < bDots) return 1;
            if (aDots > bDots) return -1;
            return 0;
        })
        .forEach((path) => {
            const commandCompletion = _.get(tree, path);
            if (!commandCompletion) {
                throw new Error(`Command path does not exist: ${path}.`);
            }
            if (commandCompletion.alias) {
                throw new Error(`This command path is alias: ${path}. Please register on full command.`);
            }
            _setRecursively(commandCompletion, _.get(collector, path));
        });
}

module.exports = register;
