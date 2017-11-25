'use strict';

const fs       = require('fs');
const CFError  = require('cf-errors');
const Context  = require('./Context');
const jsonfile = require('jsonfile');
const yaml     = require('js-yaml');
const DEFAULTS = require('../../defaults');

/**
 * A singelton class that is in charge of providing an easy interface to the authentication configuration file on the file system
 */

class Contexts {

    constructor() {

    }

    deleteContext() {

    }

    setCurrentContext() {

    }

    getCurrent() {

    }

    validateContextFileExists() {

    }

    loadConfigFile(configFilePath) {
        try {
            const doc = yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));
            this.contexts = doc.contexts;
            this.setCurrentContext(doc['current-context']);
            //TODO parse all contexts
        } catch (err) {
            if (err.code === 'ENOENT') {
                const data = {
                    contexts: [],
                    'current-context': ''
                };
                fs.writeFileSync(configFilePath, yaml.safeDump(data), 'utf8');
                return data;
            } else {
                throw new CFError({
                    cause: err,
                    message: `Failed to read configuration file from path: ${configFilePath}`
                });
            }
        }
    }

    createOrUpdate(options) {
        const key       = options.key;
        const url       = options.url;
        const aclType   = options.aclType; // currently account (in future also user)
        const tokenType = options.tokenType; // currently jwt token
        const userId    = options.userId;
        const accountId = options.accountId;

        return new Context();
    }
}

module.exports = new Contexts();