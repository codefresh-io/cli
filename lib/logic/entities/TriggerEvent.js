const Entity = require('./Entity');

class TriggerEvent extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger-event';
        this.info = data;
        this.defaultColumns = ['uri', 'type', 'kind', 'public', 'status'];
        this.wideColumns = this.defaultColumns.concat(['endpoint', 'description']);
    }

    static fromResponse(response) {
        return new TriggerEvent({
            uri: response.uri,
            type: response.type,
            kind: response.kind,
            // [0]{12} - public account ID
            public: response.account === '000000000000',
            secret: response.secret,
            status: response.status,
            endpoint: response.endpoint,
            description: response.description,
            help: response.help,
        });
    }
}

module.exports = TriggerEvent;
