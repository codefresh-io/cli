const getRoot = require('../root/get');
const deleteRoot = require('../root/delete');
const describeRoot = require('../root/describe');


const get = require('./get');
const deleteCmd = require('./delete');
const describe = require('./describe');


getRoot.subCommand(get);
deleteRoot.subCommand(deleteCmd);
describeRoot.subCommand(describe);

