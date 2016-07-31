'use strict';

var debug = require('debug')('yaml command');
var YAML  = require('./yamlFile');

debug('in yaml command defintion');

exports.command = 'yaml  <stack> ';
exports.desc = 'create codefresh yaml';
exports.builder = {};
exports.handler = function (argv) {

  debug(`arguments ${argv}`);
  let Yaml = new YAML();
  var Q = require('q');
  var Stacks = require('./stacks');
  var nodejs = Stacks.getStack("nodejs");
  debug(`nodejs : ${JSON.stringify(nodejs)}`);

  Q.nfcall(Yaml.addStack.bind(Yaml), nodejs).then(Yaml.save.bind(Yaml, null,  (err, data)=>{
      return new Promise((resolve , reject)=>{
        if (err)
         return reject(err);

         resolve(data);
      })
  }));
  debug('in handler');
  console.log(`creating yaml`);

}
