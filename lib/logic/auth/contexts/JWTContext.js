'use strict';

const _       = require('lodash');
const CFError = require('cf-errors');
const Context = require('./Context');
const jwt     = require('jsonwebtoken');
const api     = require('../../api');

const TYPE = 'JWT';

class JWTContext extends Context {

    constructor(options) {
        super(options);
        this.type      = TYPE;
        this.token     = options.token;
        this.aclType   = options.aclType;
        this.userId    = options.userId;
        this.accountId = options.accountId;
        this.expires   = new Date(options.expires * 1000);
        this.name      = `${this.userId}-${this.accountId}`;
    }

    prepareHttpOptions() {
        return {
            uri: this.url,
            headers: {
                'x-access-token': this.token,
            },
        };
    }

    async validate() {
        try {
            await api.user.getByAuthContext(null, this);
        } catch (err) {
            // TODO catch 401 errors, etc...
            throw new CFError({
                cause: err,
                message: 'Token is not valid',
            });
        }
    }

    toString() {
        return `name: ${this.name}, url: ${this.url}, expires: ${this.expires}`;
    }

    serialize() {
        return _.assignIn(super.serialize(), {
            token: this.token,
            'acl-type': this.aclType,
            'user-id': this.userId,
            'account-id': this.accountId,
            expires: this.expires.getTime() / 1000,

        });
    }

    static createFromSerialized(rawContext) {
        return new JWTContext({
            name: rawContext.name,
            url: rawContext.url,
            token: rawContext.token,
            aclType: rawContext['acl-type'],
            userId: rawContext['user-id'],
            accountId: rawContext['account-id'],
            expires: rawContext.expires,
        });
    }

    static createFromToken(token, url) {
        let decodedToken;
        try {
            decodedToken = jwt.decode(token);
        }
        catch (err) {
            throw new CFError('Passed token is not a valid token');
        }

        if (!decodedToken) {
            throw new CFError('Passed token is not a valid token');
        }

        const accountId = decodedToken.accountId;
        const userId    = decodedToken._id;
        const expires   = decodedToken.exp;

        return new JWTContext({
            accountId,
            userId,
            token,
            url,
            expires,
            aclType: 'account',
        });
    }
}

JWTContext.TYPE = TYPE;

module.exports = JWTContext;