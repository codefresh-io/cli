const _ = require('lodash');
const { authContextWrapper } = require('./helpers');

const COMPLETIONS = [
    require('./Pipeline.completion'),
];

function register(tree) {
    COMPLETIONS.forEach((completion) => {
        _.keys(completion).forEach((commandPath) => {
            const commandCompletion = _.get(tree, commandPath);
            if (!_.isEmpty(_.keys(commandCompletion))) {
                const message = commandCompletion.alias
                    ? `This command path is alias: ${commandPath}. Please register on full command.`
                    : `This command path already have completion: ${commandPath}`;
                throw new Error(message);
            }
            const completionFunction = _.get(completion, commandPath);
            _.set(tree, commandPath, authContextWrapper(completionFunction));
        });
    });

}

module.exports = register;
