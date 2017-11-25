'use strict';

const Context = require('./Context');

class JWTContext extends Context {

    constructor() {

    }

    prepareHttp() {
        // TODO implement
    }

    toString() {
        return `I am a jwt context`;
    }
}


module.exports = Context;