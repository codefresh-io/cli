const _ = require('lodash');
const Style = require('./Style');

class Formatter {
    constructor(styles) {
        this.styles = styles || {};
    }

    apply(source) {
        const keys = _.keys(source);
        if (!keys || !_.keys(this.styles)) {
            return source;
        }
        const obj = Object.assign({}, source);
        keys.forEach((key) => {
            const prop = obj[key];
            obj[key] = this.applyStyles(key, prop);
        });
        return obj;
    }

    style(key, func) {
        if (typeof func === 'function') {
            this.styles[key] = func;
        }
        return this;
    }

    applyStyles(key, prop) {
        const style = this.styles[key] || _.identity;
        return style(prop);
    }

    static build() {
        return new Formatter();
    }
}

module.exports = {
    Formatter,
    Style,
};
