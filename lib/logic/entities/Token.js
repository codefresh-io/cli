const Entity = require('./Entity');
const _ = require('lodash');

class Token extends Entity {
    constructor(data) {
        super();
        this.entityType = 'token';
        this.info = data;
        this.defaultColumns = ['id', 'name', 'token_prefix', 'created', 'scopes'];
        this.wideColumns = ['id', 'name', 'token_prefix', 'created', 'subject_type', 'subject', 'scopes'];
    }

    static fromResponse(response) {
        const data = Object.assign({}, response);
        data.id = data._id;
        data.token_prefix = response.tokenPrefix;
        data.scopes = response.scopes && response.scopes.join('\n');
        data.created = data.created ? new Date(data.created) : undefined;
        data.subject_type = _.get(data, 'subject.type');
        data.subject = _.get(data, 'subject.ref');
        return new Token(data);
    }
}

module.exports = Token;
