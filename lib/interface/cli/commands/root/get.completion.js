const { handleOptions, fileDir } = require('../../completion/helpers');

const FILENAME_OPTIONS = ['-f', '--filename'];
const OUTPUT_OPTIONS = ['-o', '--output'];

function optionHandler({ word, argv, option }) {
    if (FILENAME_OPTIONS.includes(option)) {
        return fileDir(word);
    }
    if (OUTPUT_OPTIONS.includes(option)) {
        return ['json', 'yaml', 'wide', 'name', 'id', 'jsonArray', 'yamlArray'];
    }
    return [];
}

module.exports = {
    optionHandler: handleOptions([...FILENAME_OPTIONS, ...OUTPUT_OPTIONS], optionHandler),
};

