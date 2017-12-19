'use strict';

const fs      = require('fs');
const _       = require('lodash');
const CFError = require('cf-errors');
const yaml    = require('js-yaml');

// context classes
const { JWTContext } = require('./contexts');

/**
 * A singelton that is in charge of providing an easy interface to the authentication configuration file on the file system
 */

class Manager {

    constructor() {
        this.contexts           = {};
        this.currentContextName = null;
        this.configFilePath =  process.env.HOME + "/.cfconfig";
    }

    /**
     * retrieves a context by name otherwise returns undefined
     * @param name - the identifier of the context
     * @returns {*}
     */
    getContextByName(name) {
        return this.contexts[name];
    }

    /**
     * sets the current active context
     * @param context
     */
    setCurrentContext(context) {
        if (this.getContextByName(context.name)) {
            this.currentContextName = context.name;
        } else {
            this.addContext(context);
            this.currentContextName = context.name;
        }
    }

    /**
     * returns the current active context
     * @returns {*}
     */
    getCurrentContext() {
       this.loadContexts(this.configFilePath);
        return this.contexts[this.currentContextName];
    }

    addContext(context) {
        this.contexts[context.name] = context;
    }

    _setConfigFilePath(configFilePath) {
        this.configFilePath = configFilePath;
    }

    _getConfigFilePath() {
        return this.configFilePath;
    }

    /**
     * retrieves all contexts
     * @returns {{}}
     */
    getAllContexts() {
        return this.contexts;
    }

    /**
     * Loads the passed config file.
     * This function is blocking because is it being used during the entry point of the CLI
     * @param configFilePath
     * @returns {{contexts: Array, "current-context": string}}
     */
    loadContexts(configFilePath) {
        this._setConfigFilePath(configFilePath);

        try {
            const doc = yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));
            _.forEach(doc.contexts, (rawContext) => {
                switch (rawContext.type) {
                    case JWTContext.TYPE:
                        const context = JWTContext.createFromSerialized(rawContext);
                        this.addContext(context);
                        break;
                    default:
                        throw new CFError(`Failed to parse context of type: ${rawContext.type}`);
                }
            });

            const currentContext = this.getContextByName(doc['current-context']);
            if (currentContext) {
                this.setCurrentContext(currentContext);
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                const data = {
                    contexts: {},
                    'current-context': '',
                };
                fs.writeFileSync(configFilePath, yaml.safeDump(data), 'utf8');
                return data;
            } else {
                throw new CFError({
                    cause: err,
                    message: `Failed to load configuration file from path: ${configFilePath}`,
                });
            }
        }
    }

    /**
     * stores all current contexts back to config file
     */
    persistContexts() {
        const newContextFile = {
            contexts: {},
            'current-context': this.currentContextName,
        };

        _.forEach(this.contexts, (context) => {
            newContextFile.contexts[context.name] = context.serialize();
        });

        fs.writeFileSync(this._getConfigFilePath(), yaml.safeDump(newContextFile), 'utf8');
    }
}

module.exports = new Manager();
