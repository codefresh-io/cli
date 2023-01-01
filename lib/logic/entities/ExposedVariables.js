const Entity = require('./Entity');

class ExposedVariables extends Entity {
    constructor(data) {
        super();
        this.entityType = 'build';
        this.info = data;
        this.defaultColumns = ['key', 'value', 'source'];
        this.wideColumns = this.defaultColumns.concat([]);
    }

    static fromResponse(response) {
        return new ExposedVariables({
            key: response.key,
            value: response.value,
            source: response.source,
        });
    }
}

module.exports = ExposedVariables;
