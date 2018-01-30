const yaml = require('js-yaml');

class Entity {
    // get all the information about the entity
    getInfo() {
        return this.info;
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
        return JSON.stringify(this.info, null, 4);
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
            values[key] = this[key];
        });
        return values;
    }
}

module.exports = Entity;
