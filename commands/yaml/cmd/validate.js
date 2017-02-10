'use strict';
var cyv         = require('@codefresh-io/yaml-validator');
var yaml        = require('js-yaml');
var fs          = require('fs');

exports.command = 'yaml <command> [options]';

exports.describe = 'Validate a Codefresh YAML file. Defaults to $PWD/codefresh.yml';

exports.builder = function (yargs) {
    return yargs.option('file', {
        demand: true,
        default: 'codefresh.yml',
        describe: 'Specify the path of the Codefresh YAML file to validate'
    })
        .help("h")
        .alias("h","help");
};

exports.handler = function (argv) {
    const doc = yaml.safeLoad(fs.readFileSync(argv.file, 'utf8'));
    cyv(doc);
    console.log('Rejoice! Your Codefresh YAML is valid!');
};