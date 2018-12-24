
function filenameHandler(word, argv, option) {
    if (['-f', '--filename'].includes(option)) {
        return ['test']; // todo: implement
    }
    return null;
}

module.exports = {
    paths: ['replace', 'get', 'create', 'patch', 'delete', 'run', 'diff'],
    handler: filenameHandler,
};

