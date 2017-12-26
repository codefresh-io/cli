const applyRoot = require('../root/apply.cmd');
const getRoot = require('../root/get.cmd');
const createRoot = require('../root/create.cmd');
const deleteRoot = require('../root/delete.cmd');
const replaceRoot = require('../root/replace.cmd');


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

