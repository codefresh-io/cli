const getRoot = require('../root/get');
const describeRoot = require('../root/describe');

const get = require('./get');
const describe = require('./describe');

getRoot.subCommand(get);
describeRoot.subCommand(describe);
