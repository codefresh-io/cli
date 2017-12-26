const getRoot = require('../root/get.cmd');
const deleteRoot = require('../root/delete.cmd');
const describeRoot = require('../root/describe.cmd');


const get = require('./get');
const deleteCmd = require('./delete');
const describe = require('./describe');


getRoot.subCommand(get);
deleteRoot.subCommand(deleteCmd);
describeRoot.subCommand(describe);

