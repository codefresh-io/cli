/**
 * Created by nikolai on 9.8.16.
 */
'use strict';

var debug       = require('debug')('cli-builds');
var _           = require('lodash');
var request     = require('superagent-use');
var prettyjson  = require('prettyjson');
var fs          = require('fs');
var path        = require('path');

const formatPayload = {
    isAdvanced: false,
    vars: [{"key":"test_key", "value":"test_value"}],
    yamlJson: "path to your composition.yml",
    name: "string"
};

module.exports.add = function(info) {
    console.log('file:' + info.payload);
    if(info.payload == undefined) {
        throw new Error('Please, specify --compositionFile [path to file.json]. Format file.json is\n' +
            prettyjson.render(formatPayload));
    }

    let compositionUrl = `${info.url}/api/compositions`;
    let payload = {};
    if (fs.existsSync(info.payload)) {
        payload = JSON.parse(fs.readFileSync(info.payload, 'utf8'));
        payload.yamlJson = fs.readFileSync(payload.yamlJson, 'utf8');
    } else {
        throw new Error(`File ${info.payload} doesn't exist`);
    }

    console.log('payload:' + JSON.stringify(payload));

    return (token) => {
        debug('add composition by url : ' + compositionUrl);
        console.log('add composition by url:' + compositionUrl);
        var p = new Promise((resolve, reject) => {
            request
                .post(compositionUrl)
                .send(payload)
                .on('request', function(req) {
                    console.log('trying to connect to '  + req.url);
                })
                .set('Accept', 'application/json')
                .set('Content-Type','application/json')
                .set('X-Access-Token', token)
                .end(function(err, res) {
                    debug('request completed');
                    if (err) {
                        debug(res);
                        console.log('error:'  + err);
                        return reject(err);
                    }

                    console.log(prettyjson.render(res.body));
                    resolve(res.body);
                });
        }).catch((err) => {
                throw err;
            });
        return p;
    }
};

module.exports.remove = function (info) {
    if(info.id == undefined) {
        throw new Error('Please, specify --id [id of a composition]');
    }
    let compositionUrl = `${info.url}/api/compositions/${info.id}`;

    return (token) => {
        debug('add composition by url : ' + compositionUrl);
        console.log('remove the composition by url:' + compositionUrl);
        var p = new Promise((resolve, reject) => {
            request
                .del(compositionUrl)
                .on('request', function(req) {
                    console.log('trying to connect to '  + req.url);
                })
                .set('Accept', 'application/json')
                .set('X-Access-Token', token)
                .end(function(err, res) {
                    debug('request completed');
                    console.log('completed');
                    if (err) {
                        debug(res);
                        console.log('error:'  + err);
                        return reject(err);
                    }

                    console.log(prettyjson.render(res.body));
                    resolve(res.body);
                });
        }).catch((err) => {
                console.log('error');
                throw err;
            });
        return p;
    }
};

module.exports.getAll = function (info) {
    let compositionUrl = `${info.url}/api/compositions`;

    return (token) => {
        debug('get a composition by url : ' + compositionUrl);
        console.log('get the compositions by url:' + compositionUrl);
        var p = new Promise((resolve, reject) => {
            request
                .get(compositionUrl)
                .on('request', function(req) {
                    console.log('trying to connect to '  + req.url);
                })
                .set('Accept', 'application/json')
                .set('X-Access-Token', token)
                .end(function(err, res) {
                    debug('request completed');
                    if (err) {
                        debug(res);
                        console.log('error:'  + err);
                        return reject(err);
                    }

                    console.log(prettyjson.render(res.body));
                    resolve(res.body);
                });
        }).catch((err) => {
                throw err;
            });
        return p;
    }
};

module.exports.run = function (info) {
    if(info.id == undefined) {
        throw new Error('Please, specify --id [id or name of a composition]');
    }
    let compositionUrl = `${info.url}/api/compositions/${info.id}/run`;
    let payload = {
        vars: info.vars
    };

    console.log('payload:' + JSON.stringify(payload));
    return (token) => {
        debug('run the composition by url : ' + compositionUrl);
        console.log('run the composition by url:' + compositionUrl);
        var p = new Promise((resolve, reject) => {
            request
                .post(compositionUrl)
                .send(payload)
                .on('request', function(req) {
                    console.log('trying to connect to '  + req.url);
                })
                .set('Accept', 'application/json')
                .set('Content-Type','application/json')
                .set('X-Access-Token', token)
                .end(function(err, res) {
                    debug('request completed');
                    if (err) {
                        debug(res);

                        console.log('error:'  + err + '; res:' + String(res.error));
                        return reject(err);
                    }

                    console.log(prettyjson.render(res.body));
                    resolve(res.body);
                });
        }).catch((err) => {
                throw err;
            });
        return p;
    }
};