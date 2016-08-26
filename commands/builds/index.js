// my-module.js
'use strict';
var CFError = require('cf-errors');
var debug   = require('debug')('login->index');
var Login   = require('../login/connector');
var _       = require('lodash');

exports.command = 'builds [account] <repo>';

exports.describe = 'build in codefresh ';

var allOperations = [
  'getAll', 'build'
];

exports.builder = function (yargs) {
  return yargs.option('url', {
    alias: 'url',
    default: 'https://g.codefresh.io'
  }).option('account', {
    demand: false,
    alias: 'a',
    describe: 'account name'
  }).option('repo', {
    demand: true,
    alias: 'r',
    describe: 'repo name'
  }).option('repoOwner', {
    demand: true,
    alias: 'o',
    describe: 'repo owner'
  }).option('pipelineName', {
    demand: false,
    describe: 'name of pipeline from repo'
  }).option('branch', {
    demand: false,
    describe: 'name of branch'
  }).option('sha', {
    demand: false,
    describe: 'sha of commit'
  }).option('tofile', {
    type: 'string',
    describe: 'save output to file'
  })
      .option('operation', {
        demand: true,
        type: 'string',
        describe: 'available the following operations with builds getAll/build'
      })
      .help("h")
      .alias("h","help");
};

exports.handler = function (argv) {
  var info = {};
  info.url = argv.url;
  info.account = argv.account;
  info.repoOwner = argv.repoOwner;
  info.repoName = argv.repo;
  info.operation = argv.operation;
  info.pipelineName = argv.pipelineName;
  info.sha = argv.sha;
  info.branch = argv.branch;
  info.tofile = argv.tofile;

  if(!_.includes(allOperations, argv.operation)) {
    throw new CFError({
      name: 'InvalidParameter',
      message: `Use one of the following operations: ${JSON.stringify(allOperations)}`
    });
  }

  var login = new Login({file: argv.tokenFile, token : argv.token}, argv.url, argv.user, argv.password);
  var builds;
  switch(argv.operation) {
    case 'build':
      builds = require('./command').build(info);
      break;
    case 'getAll':
      builds = require('./command').getAll(info);
      break;
  }

  login.connect().then(builds.bind(login.token), (err) => {
    debug('error:' + err);
    process.exit(err);
  });
};
