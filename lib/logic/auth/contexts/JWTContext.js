const _ = require('lodash');
const CFError = require('cf-errors');
const Context = require('./Context');
const jwt = require('jsonwebtoken');
const api = require('../../api');

const TYPE = 'JWT';

class JWTContext extends Context {
    constructor(options) {
        super(options);
        this.type = TYPE;
        this.token = options.token;
        this.aclType = options.aclType;
        this.userId = options.userId;
        this.userName = options.userName;
        this.accountId = options.accountId;
        this.accountName = options.accountName;
        this.expires = new Date(options.expires * 1000);
        this.name = options.name || this.name;
        this.defaultColumns = ['current', 'name', 'url', 'account', 'status'];
        this.beta = options.beta || this.beta;
        this.onPrem = options.onPrem || this.onPrem;
    }

    _reCalculateName() {
        if (this.userName && this.accountName) {
            this.name = `${this.userName}/${this.accountName}`;
        } else {
            this.name = `${this.userId}/${this.accountId}`;
        }
    }

    prepareHttpOptions() {
        return {
            baseUrl: this.url,
            headers: {
                'x-access-token': this.token,
            },
        };
    }

    async validate() {
        try {
            const user = await api.user.getByAuthContext(this);
            this.userName = user.userName;
            const account = _.find(user.account, acc => acc._id === this.accountId);
            this.accountName = _.get(account, 'name');
            this._reCalculateName();
            return user;
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
        const data = {
            token: this.token,
            'acl-type': this.aclType,
            'user-id': this.userId,
            'account-id': this.accountId,
            expires: this.expires.getTime() / 1000,
            beta: this.beta,
            onPrem: this.onPrem,
        };

        if (this.userName) {
            data['user-name'] = this.userName;
        }

        if (this.accountName) {
            data['account-name'] = this.accountName;
        }

        return _.assignIn(super.serialize(), data);
    }

    static createFromSerialized(rawContext) {
        return new JWTContext({
            name: rawContext.name,
            url: rawContext.url,
            token: rawContext.token,
            aclType: rawContext['acl-type'],
            userId: rawContext['user-id'],
            userName: rawContext['user-name'],
            accountId: rawContext['account-id'],
            accountName: rawContext['account-name'],
            expires: rawContext.expires,
            beta: rawContext.beta,
            onPrem : rawContext.onPrem,
        });
    }

    static createFromToken(token, url) {
        let decodedToken;
        try {
            decodedToken = jwt.decode(token);
        } catch (err) {
            throw new CFError('Passed token is not a valid token');
        }

        if (!decodedToken) {
            throw new CFError('Passed token is not a valid token');
        }

        const { accountId } = decodedToken;
        const userId = decodedToken._id;
        const expires = decodedToken.exp;

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
