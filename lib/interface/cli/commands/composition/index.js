const getRoot = require('../root/get-cmd');
const createRoot = require('../root/create-cmd');
const deleteRoot = require('../root/delete-cmd');
const replaceRoot = require('../root/replace-cmd');
const describeRoot = require('../root/describe-cmd');


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

