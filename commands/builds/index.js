'use strict';
var CFError = require('cf-errors');
var Login   = require('../login/connector');
var _       = require('lodash');
var prettyjson  = require('prettyjson');

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
    demand: true,
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
  }).option('table', {
    type: "boolean",
    describe: "output as table"
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
  info.table = argv.table;

  if(!_.includes(allOperations, argv.operation)) {
    throw new CFError({
      name: 'InvalidParameter',
      message: `Use one of the following operations: ${JSON.stringify(allOperations)}`
    });
  }

  var login = new Login(argv.url,
      {
        access:{file: argv.tokenFile, token : argv.token},
        user: argv.user,
        password: argv.password
      });
  var builds;
  switch(argv.operation) {
    case 'build':
      builds = require('./command').build(info);
      break;
    case 'getAll':
      builds = require('./command').getAll(info);
      break;
  }

  login.connect().then(builds.bind(login.token),
      (err) => {
        var cferror = new CFError({
          name: 'AuthorizationError',
          message: err.message
        });
        console.log(prettyjson.render({
          name: cferror.name,
          stack: cferror.stack
        }));
        process.exit(err);
      });
};