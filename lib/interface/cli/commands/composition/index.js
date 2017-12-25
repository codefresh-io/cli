const getRoot = require('../root/get');
const createRoot = require('../root/create');
const deleteRoot = require('../root/delete');
const replaceRoot = require('../root/replace');
const describeRoot = require('../root/describe');


const get = require('./get');
const create = require('./create');
const deleteCmd = require('./delete');
const replace = require('./replace');
const describe = require('./describe');


getRoot.subCommand(get);
createRoot.subCommand(create);
deleteRoot.subCommand(deleteCmd);
replaceRoot.subCommand(replace);
describeRoot.subCommand(describe);

