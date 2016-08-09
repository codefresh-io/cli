/**
 * Created by nikolai on 9.8.16.
 */
"use strict";

var assert      = require('assert');
var debug       = require('debug')('connector.spec');
var request     = require('superagent-use');
var prettyjson  = require('prettyjson');

describe('compositions test', () => {
    var login ;
    var url;
    before((done) => {
        console.log('test setup');

        var Login = require('../login/connector');
        url =  'https://g-staging.codefresh.io';
        login = new Login('', '', url);
        done();
    });
});