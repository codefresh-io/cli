/**
 * Created by nikolai on 9.8.16.
 * compositions
 */
'use strict';
var request         = require('request');
var debug           = require('debug')('compositions');
var prettyjson      = require('prettyjson');
var fs              = require('fs');
var Q               = require('q');
var Composition     = require('./composition');
var Environments    = require('../../environments/command');
var helper          = require('../../../helper/helper');

module.exports.add = function(info) {
    let compositionUrl = `${info.url}/api/compositions`;
    let payload = {};
    if (fs.existsSync(info.file)) {
        payload = JSON.parse(fs.readFileSync(info.file, 'utf8'));
        payload.yamlJson = fs.readFileSync(payload.yamlJson, 'utf8');
    } else {
        throw new Error(`File ${info.file} doesn't exist`);
    }

    return (token) => {
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
                    console.log('Response body:\n' + prettyjson.render(body));
                }
                deferred.resolve(body);
            });
        return deferred.promise;
    };
};

module.exports.remove = function (info) {
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
    };
};

var outputTo = function (body, info) {
    var isJson = false;
    if(helper.IsJson(body)) {
        body = JSON.parse(body);
        isJson = true;
    }

    if(Array.isArray(body) && info.limit) {
        body.splice(info.limit, Number.MAX_VALUE);
    }

    if(info.tofile) {
        helper.toFile(info.tofile, JSON.stringify(body));
        return prettyjson.render(body);
    }

    if(info.table && isJson) {
        helper.toTable("composition", body, Composition.getHeader());
        return prettyjson.render(body);
    }

    console.log('Response body:' + prettyjson.render(body));
    return body;
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
            deferred.resolve(outputTo(body, info));
        });
        return deferred.promise;
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
            debug('body:' + JSON.stringify(body));
            resolve(new Composition.Composition(JSON.parse(body)));
        });
    });
    return p;
};

module.exports.run = function (info) {
    return (token) => {
        getByIdentifier(info, token).then(function (model) {
            runCompose(info, token)
                .then(function () {
                    Environments.followEnvProgress({
                        url: info.url,
                        token: token,
                        nameCompose: `Composition - ${model.getName()}`
                    }).then(function (res) {
                        console.log(prettyjson.render(res.toString()));
                    }, (err) => {
                        console.log(err);
                        throw new Error(err);
                    });
                }, (err) => {
                    console.log(err);
                    throw new Error(err);
                });
        }, (err) => {
            console.log(err);
            throw new Error(err);
        });
    };
};