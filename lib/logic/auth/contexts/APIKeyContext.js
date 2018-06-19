const _ = require('lodash');
const CFError = require('cf-errors');
const Context = require('./Context');
const api = require('../../api');

const TYPE = 'APIKey';

class APIKeyContext extends Context {
    constructor(options) {
        super(options);
        this.type = TYPE;
        this.token = options.token;
        this.name = options.name || this.name;
        this.defaultColumns = ['current', 'name', 'url', 'account', 'status'];
        this.beta = options.beta || this.beta;
        this.onPrem = options.onPrem || this.onPrem;
    }

    prepareHttpOptions() {
        return {
            baseUrl: this.url,
            headers: {
                Authorization: this.token,
            },
        };
    }

    async validate() {
        try {
            return await api.user.getByAuthContext(this);
        } catch (err) {
            // TODO catch 401 errors, etc...
            throw new CFError({
                cause: err,
                message: 'API Key is not valid',
            });
        }
    }

    toString() {
        return `name: ${this.name}, url: ${this.url}`;
    }

    serialize() {
        const data = {
            token: this.token,
            beta: this.beta,
            onPrem: this.onPrem,
        };

        return _.assignIn(super.serialize(), data);
    }

    static createFromSerialized(rawContext) {
        return new APIKeyContext({
            name: rawContext.name,
            url: rawContext.url,
            token: rawContext.token,
            beta: rawContext.beta,
            onPrem: rawContext.onPrem,
        });
    }

    static createFromToken(token, url) {
        return new APIKeyContext({
            token,
            url,
        });
    }
}

APIKeyContext.TYPE = TYPE;

module.exports = APIKeyContext;
