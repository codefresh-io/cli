/**
 * Created by nikolai on 9.8.16.
 * compositions
 */
'use strict';

var debug           = require('debug')('cli-builds');
var _               = require('lodash');
var request         = require('request');
var prettyjson      = require('prettyjson');
var fs              = require('fs');
var path            = require('path');
var Q               = require('q');
var Composition     = require('./composition');
var Environments    = require('../environments/new/command');
var helper          = require('../../helper/helper');

const formatPayload = {
    isAdvanced: false,
    vars: [{"key":"test_key", "value":"test_value"}],
    yamlJson: "path to your composition.yml",
    name: "string"
};

module.exports.add = function(info) {
    console.log('file:' + info.file);
    if(info.file == undefined) {
        throw new Error('Please, specify --file [path to file.json]. Format file.json is\n' +
            prettyjson.render(formatPayload));
    }

    let compositionUrl = `${info.url}/api/compositions`;
    let payload = {};
    if (fs.existsSync(info.file)) {
        payload = JSON.parse(fs.readFileSync(info.file, 'utf8'));
        payload.yamlJson = fs.readFileSync(payload.yamlJson, 'utf8');
    } else {
        throw new Error(`File ${info.file} doesn't exist`);
    }

    console.log('payload:' + JSON.stringify(payload));

    return (token) => {
        console.log('adding the composition by url:' + compositionUrl);
        var deferred = Q.defer();

        var headers = {
            'Accept': 'application/json',
            'Content-Type':'application/json',
            'X-Access-Token': token
        };

        request.post({url: compositionUrl, headers: headers, json: payload},
            function (err, httpRes, body) {
                if (err) {
                    deferred.reject(err);
                }
                if(info.tofile) {
                    helper.toFile(info.tofile, JSON.parse(body));
                } else {
                    console.log('Response body:' + prettyjson.render(JSON.parse(body)));
                }
                deferred.resolve(body);
            });
        return deferred.promise;
    }
};

module.exports.remove = function (info) {
    if(info.id == undefined) {
        throw new Error('Please, specify --id [id of a composition]');
    }
    let compositionUrl = `${info.url}/api/compositions/${info.id}`;

    return (token) => {
        console.log('removing the composition by url:' + compositionUrl);
        var deferred = Q.defer();
        var headers = {
            'Accept': 'application/json',
            'X-Access-Token': token
        };
        request.del({url: compositionUrl, headers: headers}, function (err, httpRes, body) {
            console.log('Response code:' + httpRes.statusCode);
            if (err) {
                deferred.reject(err);
            }

            console.log('Response body:'+prettyjson.render(body));
            deferred.resolve(body);
        });
        return deferred.promise;

        //var p = new Promise((resolve, reject) => {
        //    request
        //        .del(compositionUrl)
        //        .on('request', function(req) {
        //            console.log('trying to connect to '  + req.url);
        //        })
        //        .set('Accept', 'application/json')
        //        .set('X-Access-Token', token)
        //        .end(function(err, res) {
        //            debug('request completed');
        //            console.log('completed');
        //            if (err) {
        //                debug(res);
        //                console.log('error:'  + err);
        //                return reject(err);
        //            }
        //
        //            console.log(prettyjson.render(res.body));
        //            resolve(res.body);
        //        });
        //}).catch((err) => {
        //        console.log('error');
        //        throw err;
        //    });
        //return p;
    }
};

module.exports.getAll = function (info) {
    let compositionUrl = `${info.url}/api/compositions`;

    return (token) => {
        console.log('get the compositions by url:' + compositionUrl);
        var deferred = Q.defer();
        var headers = {
            'Accept': 'application/json',
            'X-Access-Token': token
        };
        request.get({url: compositionUrl, headers: headers}, function(err, httpRes, body) {
            if (err) {
                deferred.reject(err);
            }
            if(info.tofile) {
                helper.toFile(info.tofile, JSON.parse(body));
            } else {
                console.log('Response body:'+prettyjson.render(body));
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    }
};

module.exports.run = function (info) {
    if(info.id == undefined) {
        throw new Error('Please, specify --id [id or name of a composition]');
    }

    return (token) => {
        getByIdentifier(info, token).then(function (model) {
            runCompose(info, token)
                .then(function (res) {
                    Environments.followEnvProgress({
                        url: info.url,
                        token: token,
                        nameCompose: model.getName()
                    }).then(function (res) {
                        console.log(prettyjson.render(res.getPublicUrls()));
                    });
                }, (err) => {
                    console.log(err);
                    throw new Error(err);
                });
        });
    };
};

var runCompose = function (info, token) {
    var p = new Promise((resolve, reject) => {
        var url = `${info.url}/api/compositions/${info.id}/run`,
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Access-Token': token
            },
            body = {
                vars: info.vars
            };

        request.post({url: url, headers: headers, json: body}, function (err, httpRes, res) {
            if (err) {
                console.log('error:'  + err + '; res:' + String(res.error));
                return reject(err);
            }

            if(!res.id) {
                return reject(res);
            }
            resolve(res);
        });
    });
    return p;
};

var getByIdentifier = function (info, token) {
    var p = new Promise((resolve, reject) => {
        var url = `${info.url}/api/compositions/${info.id}`,
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Access-Token': token
            };
        request.get({url: url, headers: headers}, function (err, httpResponse, body) {
            if(err) {
                console.log('err:' + err);
                return reject(err);
            }
            resolve(new Composition.Composition(body));
        });
    });
    return p;
};