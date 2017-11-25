const CFError = require('cf-errors');
const uuidv4  = require('uuid/v4');

class Context {

    constructor(options) {
        this.name = options.name || uuidv4();
        this.url  = options.url;
    }

    /**
     * validates the context against codefresh
     */
    validate() {
        throw new CFError('Not implemented');
    }

    /**
     * should prepare context for http request
     */
    prepareHttpOptions() {
        throw new CFError('Not implemented');
    }

    toString() {
        throw new CFError('Not implemented');
    }

    static createFromSerialized() {
        throw new CFError('Not implemented');
    }

    serialize() {
        return {
            type: this.type,
            name: this.name,
            url: this.url,
        };
    }
}


module.exports = Context;