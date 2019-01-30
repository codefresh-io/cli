const { handleOptions, fileDir } = require('../../completion/helpers');

const FILENAME_OPTIONS = ['--variable-file', '--var-file', '--yaml', '-y'];

function optionHandler({ word, argv, option }) {
    if (FILENAME_OPTIONS.includes(option)) {
        return fileDir(word);
    }
    return [];
}

module.exports = {
    optionHandler: handleOptions([...FILENAME_OPTIONS], optionHandler),
};

