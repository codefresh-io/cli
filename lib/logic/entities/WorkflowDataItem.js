const _ = require('lodash');
const Entity = require('./Entity');

class WorkflowDataItem extends Entity {
    constructor(data) {
        super();
        this.entityType = 'workflow-data-item';
        this.info = data;
        this.defaultColumns = [
            'id',
            'created-at',
            'data',
        ];
        this.wideColumns = _.clone(this.defaultColumns);
    }

    static _strinfigyData(input) {
        if (input.data === '*****') {
            return input;
        }
        const data = JSON.stringify(input.data);
        return {
            ...input,
            data,
        };
    }

    toDefault() {
        return WorkflowDataItem._strinfigyData(super.toDefault());
    }

    toWide() {
        return WorkflowDataItem._strinfigyData(super.toWide());
    }

    static fromResponse(response) {
        const id = response._id;
        const createdAt = _.get(response, 'metadata.createdAt');
        const data = _.get(response, 'data', '*****');
        return new WorkflowDataItem({
            id,
            'created-at': createdAt,
            data,
        });
    }
}

module.exports = WorkflowDataItem;
