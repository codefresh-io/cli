'use strict';

const jsonfile = require('jsonfile');

class Context {

    constructor() {

    }

    prepareHttp() {
        // TODO should handle adding authentication context to http requests
    }

    toString() {
        return `I am a context`;
    }
}


module.exports = Context;