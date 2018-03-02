const debug = require('debug')('codefresh:auth:whoami');
const Command = require('../../Command');
const _ = require('lodash');
const { printTableForAuthContexts } = require('../../helpers/auth');
const authRoot = require('../root/auth.cmd');
const { auth } = require('../../../../logic');
const authManager = auth.manager;
const {sendHttpRequest } = require('../../../../logic/api/helper');
const {whoami} = require('../../../../logic/auth/whoami')
debugger;
const command = new Command({
    command: 'whoami',
    root: true,
  //  parent: authRoot,
    description: 'print account name and some personal data for current context',
    webDocs: {
        category: 'Authentication',
        title: 'whoami',
    },
    builder: (yargs) => {
        return yargs
            .example('codefresh whoami', 'show the additional info of current context');
    },
    handler: async (argv) => {
      return whoami();
    },
});


module.exports = command;
