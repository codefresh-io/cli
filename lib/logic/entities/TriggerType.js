const Entity = require('./Entity');

class TriggerType extends Entity {
    constructor(data) {
        super();
        this.entityType = 'trigger-type';
        this.info = data;
        this.defaultColumns = ['type', 'kind', 'uri-template'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new TriggerType({
            type: response.type,
            kind: response.kind,
            'uri-template': response['uri-template'],
            'uri-regex': response['uri-regex'],
            'help-url': response['help-url'],
            config: response.config,
            filters: response.filters,
        });
    }
}

module.exports = TriggerType;
