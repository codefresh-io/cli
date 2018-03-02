const fs = require('fs');
const _ = require('lodash');
const CFError = require('cf-errors');
const yaml = require('js-yaml');
const defaults = require('../../defaults')

// context classes
const { JWTContext, APIKeyContext } = require('./contexts');

/**
 * A singelton that is in charge of providing an easy interface to the authentication configuration file on the file system
 */

class Manager {
    constructor() {
        this.contexts = {};
        this.currentContextName = null;
    }

    /**
     * retrieves a context by name otherwise returns undefined
     * @param name - the identifier of the context
     * @returns {*}
     */
    getContextByName(name) {
      let context =  _.get(this.contexts, name, undefined);
      return context;
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
        context.current = "true";
    }

    /**
     * returns the current active context
     * @returns {*}
     */
    getCurrentContext() {
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
    loadContexts(configFilePath, cfToken, cfUrl) {
        this._setConfigFilePath(configFilePath);

        try {
            const doc = yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));
            _.forEach(doc.contexts, (rawContext) => {
                switch (rawContext.type) {
                    case JWTContext.TYPE: {
                        const context = JWTContext.createFromSerialized(rawContext);
                        this.addContext(context);
                        break;
                    }
                    case APIKeyContext.TYPE: {
                        const context = APIKeyContext.createFromSerialized(rawContext);
                        this.addContext(context);
                        break;
                    }
                    default: {
                        throw new CFError(`Failed to parse context of type: ${rawContext.type}`);
                    }
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
            } else {
                throw new CFError({
                    cause: err,
                    message: `Failed to load configuration file from path: ${configFilePath}`,
                });
            }
        }

        // Supports the ability to use the cli with a JWT token
        // TODO in the future when we support more than 1 type of token (Currently only JWT) we need to refactor this
        if (cfToken && cfUrl) {
            try {
                const context = JWTContext.createFromToken(cfToken, cfUrl);
                this.addContext(context);
                this.setCurrentContext(context);
            } catch (err) {
                try {
                    const context = APIKeyContext.createFromToken(cfToken, cfUrl);
                    this.addContext(context);
                    this.setCurrentContext(context);
                } catch (error) {
                    throw new CFError({
                        cause: error,
                        message: 'Failed to parse CF_API_KEY environment variable',
                    });
                }
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
