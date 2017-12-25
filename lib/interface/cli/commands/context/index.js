const applyRoot = require('../root/apply');
const getRoot = require('../root/get');
const createRoot = require('../root/create');
const deleteRoot = require('../root/delete');
const replaceRoot = require('../root/replace');


const apply = require('./apply');
const get = require('./get');
const create = require('./create');
const deleteCmd = require('./delete');
const replace = require('./replace');


applyRoot.subCommand(apply);
getRoot.subCommand(get);
createRoot.subCommand(create);
deleteRoot.subCommand(deleteCmd);
replaceRoot.subCommand(replace);

