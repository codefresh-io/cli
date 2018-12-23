const _ = require('lodash');

const COMPLETIONS = [
];

function register(tree) {
    COMPLETIONS.forEach((completion) => {
        _.keys(completion).forEach((commandPath) => {
            const commandCompletion = _.get(tree, commandPath);
            if (commandCompletion.alias) {
                throw new Error(`This command path is alias: ${commandPath}. Please register on full command.`);
            }
            const completionFunction = _.get(completion, commandPath);
            _.set(tree, `${commandPath}.__optionHandler`, completionFunction);
        });
    });

}

module.exports = register;
