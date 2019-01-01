const { handleOptions } = require('../../completion/helpers');

function optionHandler({ word, argv, option }) {
    return ['json', 'yaml', 'wide', 'name', 'id'];
}

module.exports = {
    optionHandler: handleOptions(['-o', '--output'], optionHandler),
};

