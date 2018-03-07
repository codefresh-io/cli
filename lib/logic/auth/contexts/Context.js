const CFError = require('cf-errors');
const uuidv4 = require('uuid/v4');
const { whoami } = require('./whoami');

class Context {
    constructor(options) {
        this.name = options.name || uuidv4();
        this.url = options.url;
        this.beta = false;
    }

    isBetaFeatEnabled() {
        return this.beta;
    }

    async addAccountInfo() {
        try {
            const { name, runtimeEnvironment } = await whoami(this);
            this.account = name;
            this.runtimeEnvironment = runtimeEnvironment;
            this.status = 'Valid';
        } catch (err) {
            this.status = 'Revoked';
        }
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getUrl() {
        return this.url;
    }

    /**
     * validates the context against codefresh
     */
    validate() { // eslint-disable-line
        throw new CFError('Not implemented');
    }

    /**
     * should prepare context for http request
     */
    prepareHttpOptions() { // eslint-disable-line
        throw new CFError('Not implemented');
    }

    toString() {
        return `name: ${this.name}, url: ${this.url}`;
    }

    static createFromSerialized() {
        throw new CFError('Not implemented');
    }

    serialize() {
        return {
            type: this.type,
            name: this.name,
            url: this.url,
        };
    }

    toDefault() {
        return this.extractValues(this.defaultColumns);
    }

    extractValues(columns) {
        const values = {};
        columns.forEach((key) => {
            values[key] = this.info[key];
        });
        return values;
    }
}


module.exports = Context;
