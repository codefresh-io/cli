const annotateRoot = require('../root/annotate.cmd');
const getRoot = require('../root/get.cmd');
const describeRoot = require('../root/describe.cmd');

const annotate = require('./annotate');
const get = require('./get');
const describe = require('./describe');

annotateRoot.subCommand(annotate);
getRoot.subCommand(get);
describeRoot.subCommand(describe);
