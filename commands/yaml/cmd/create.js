'use strict';

var debug = require('debug')('yaml command');
var YAML  = require('./../yamlFile');
var Stacks = require('./../stacks');

debug('in yaml command defintion');

exports.command = 'yaml [options]';
exports.desc = 'create codefresh yaml';

exports.builder = function (yargs) {
  return yargs.option('stack', {
    alias: 's',
    default: 'nodejs'
  }).option('file', {
    alias: 'f',
    default : "codefresh.yml"
  })
      .help("h")
      .alias("h","help");
};

exports.handler = function (argv) {
  debug(`arguments ${JSON.stringify(argv)}`);

  let Yaml = new YAML();
  var Q = require('q');

  var nodejs = Stacks.getStack(argv.stack);

  if (!nodejs) {
    console.log(`${argv.stack} stack not found`);
    return process.exit("stack not found");
  }

  debug(`nodejs : ${JSON.stringify(nodejs)}`);

  Q.nfcall(Yaml.addStack.bind(Yaml), nodejs)
      .then(Yaml.save.bind(Yaml), null, (err, data) => {
        return new Promise((resolve , reject) => {
          if (err)
            return reject(err);
          resolve(data);
        });
      });

  debug('in handler');
  console.log(`creating yaml`);
};
