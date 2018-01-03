const _ = require('lodash');
const CFError = require('cf-errors');
const Context = require('./Context');
const jwt = require('jsonwebtoken');
const api = require('../../api');

const TYPE = 'API';

class APIContext extends Context {
    constructor(options) {
        super(options);
        this.type = TYPE;
        this.token = options.token;
        this.name = options.name || this.name;
        this.defaultColumns = ['current', 'name', 'url'];
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
            const user = await api.user.getByAuthContext(this);
            this.userName = user.userName;
        } catch (err) {
            // TODO catch 401 errors, etc...
            throw new CFError({
                cause: err,
                message: 'Token is not valid',
            });
        }
    }

    toString() {
        return `name: ${this.name}, url: ${this.url}`;
    }

    serialize() {
        const data = {
            token: this.token,
        };

        if (this.userName) {
            data['user-name'] = this.userName;
        }
        return _.assignIn(super.serialize(), data);
    }

    static createFromSerialized(rawContext) {
        return new APIContext({
            name: rawContext.name,
            url: rawContext.url,
            token: rawContext.token,
        });
    }

    static createFromToken(token, url) {

        return new APIContext({
            token,
            url,
        });
    }
}

APIContext.TYPE = TYPE;

module.exports = APIContext;
