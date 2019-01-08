const { fileDir } = require('../../completion/helpers');

function positionalHandler({ word, argv}) {
    return fileDir(word);
}

module.exports = {
    positionalHandler,
};

