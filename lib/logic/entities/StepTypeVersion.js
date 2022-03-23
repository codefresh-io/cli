const Entity = require('./Entity');

class StepTypeVersion extends Entity {
    constructor(data) {
        super();
        this.entityType = 'step-type-version';
        this.info = data;
        this.version = this.info;
        this.defaultColumns = ['version'];
        this.wideColumns = this.defaultColumns;
    }

    static fromResponse(response) {
        return new StepTypeVersion(response);
    }
}

module.exports = StepTypeVersion;
