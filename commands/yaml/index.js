'use strict';

var debug = require('debug')('yaml command');
var YAML  = require('./yamlFile');

debug('in yaml command defintion');

exports.command = 'yaml  <stack> ';
exports.desc = 'create codefresh yaml';
exports.builder = {};
exports.handler = function (argv) {

  debug(`arguments ${argv}`);
  Yaml = new YAML();
  debug('in handler');
  console.log(`creating yaml`);

}
