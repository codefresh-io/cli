
function outputHandler(word, argv, option) {
    if (['-o', '--output'].includes(option)) {
        return ['json', 'yaml', 'wide', 'name', 'id'];
    }
    return null;
}

module.exports = {
    paths: ['get'],
    handler: outputHandler,
};

