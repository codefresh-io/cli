const yaml   = require('js-yaml');

class Entity {
    toDefault() {
        return this.extractValues('default');
    }
    toWide() {
        return this.extractValues('wide');
    }

    toJson() {
        return JSON.stringify(this.info, null , '\t');
    }

    toYaml() {
        return yaml.safeDump(this.info);
    }

    toName() {
        return this.entityType + '/' + this.info.name;
    }

    extractValues(type) {
        const values = {};
        if (type === 'default') {
            this.defaultColumns.forEach((key) => {
                values[key] = this.info[key];
            });
        }
        else if (type === 'wide') {
            this.wideColumns.forEach((key) => {
                values[key] = this.info[key];
            });
        }
        return values;
    }
}

module.exports = Entity;
