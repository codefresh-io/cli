const yaml   = require('js-yaml');

class Entity {
    toWide(data) {
        console.log(Object.keys(data));
    }

    toJson(data) {
        console.log(JSON.stringify(data, null , '\t'));
    }

    toYaml(data) {
        const json = JSON.stringify(data, null , '\t');
        console.log(yaml.safeLoad(json));
    }

    toName(name, type) {
        console.log(type + '/' + name);
    }
}

module.exports = Entity;
