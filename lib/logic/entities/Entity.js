const yaml = require('js-yaml');
const _ = require('lodash');

class Entity {
    // get all the information about the entity
    getInfo() {
        return this.info;
    }

    // get the type of the context from spec.type
    getType() {
        return _.get(this, 'info.type');
    }

    // default Columns means all the fields we want to show at when using get and the user is not specify which kind of output he want (not include a lot of information)
    toDefault() {
        return this.extractValues(this.defaultColumns);
    }
    // wide Columns means all the fields we want to show when using get with -o wide option (return more information then the defualt)
    toWide() {
        return this.extractValues(this.wideColumns);
    }

    toJson() {
        return JSON.stringify(this.info, null, '\t');
    }

    toYaml() {
        return yaml.safeDump(this.info);
    }

    toName() {
        return `${this.entityType}/${this.info.name}`;
    }

    extractValues(columns) {
        const values = {};
        columns.forEach((key) => {
            values[key] = this.info[key];
        });
        return values;
    }

    // TODO: choose which information to show when using describe command
    describe() {
        return yaml.safeDump(this.info);
    }
}

module.exports = Entity;
