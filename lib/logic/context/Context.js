const CFError = require('cf-errors');

class Context {
    /**
     * should prepare context for http request
     */
    prepareHttp() {
        throw new CFError('Not implemented');
    }

    toString() {
        throw new CFError('Not implemented');
    }
}


module.exports = Context;