const annotateRoot = require('../root/annotate');
const getRoot = require('../root/get');
const describeRoot = require('../root/describe');

const annotate = require('./annotate');
const get = require('./get');
const describe = require('./describe');

annotateRoot.subCommand(annotate);
getRoot.subCommand(get);
describeRoot.subCommand(describe);
