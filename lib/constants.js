const { homedir } = require('os');
const path = require('path');

const codefreshPath = path.resolve(homedir(), '.Codefresh');


module.exports = {
    codefreshPath,
};
