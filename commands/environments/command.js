/**
 * Created by nikolai on 11.8.16.
 * environments
 */
'use strict';
var _           = require('lodash');
var request     = require('request');
var prettyjson  = require('prettyjson');
var Q           = require('q');
var Environment = require('./environment');
var helper      = require('../../helper/helper');

module.exports.get = function (info) {
    let url = info.targetUrl;

    return (token) => {
        console.log('url:' + url);
        var deferred = Q.defer();
        var headers = {
            'Accept': 'application/json',
            'X-Access-Token': token
        };
        request.get({url: url, headers: headers}, function (err, httpRes, res) {
            console.log('Response code:' + httpRes.statusCode);
            if (err) {
                deferred.reject(err);
            }

            console.log('Response body:' +
                (helper.IsJson(res) ? prettyjson.render(JSON.parse(res)) : res) );

            deferred.resolve(res.body);
        });
        return deferred.promise;
    };
};

module.exports.getAll = function (info) {
    let url = info.targetUrl;

    return (token) => {
        console.log('url:' + url);
        var deferred = Q.defer();
        var headers = {
            'Accept': 'application/json',
            'X-Access-Token': token
        };
        request.get({url: url, headers: headers}, function (err, httpRes, res) {
            if (err) {
                deferred.reject(err);
            }

            if(helper.IsJson(res)) {
                var array = JSON.parse(res);
                var envs = [];
                _.each(array, function (item) {
                    envs.push((new Environment.Environment(item)).toString());
                });
                console.log(prettyjson.render(envs));
            } else {
                console.log(`Response body:${res}`);
            }

            deferred.resolve(res.body);
        });
        return deferred.promise;
    };
};

var findEnvByComposeName = function (pUrl, name, token) {
    var deferred = Q.defer();
    var envName = `ENV-composition-${name}`;
    var url = `${pUrl}/api/environments`,
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Access-Token': token
        };

    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(err);
        }
        if(body.length === 0) {
            deferred.resolve(false);
        }

        var res = _.find(JSON.parse(body), {"name":envName});
        if(!res.name) {
            deferred.resolve(false);
        }
        deferred.resolve(new Environment.Environment(res));
    });
    return deferred.promise;
};

var followEnvProgress = function (data) {
    var deferred = Q.defer();
    process.stdout.write('Waiting ...');
    var intervalId = setInterval(function() { process.stdout.write('.'); }, 1000);
    var repeat = () => {
        findEnvByComposeName(data.url, data.nameCompose, data.token)
            .then((env) => {
                if(env.getStatus() !== 'done') {
                    setTimeout(() => repeat(), 1000);
                } else {
                    process.stdout.write(' done!\n');
                    clearInterval(intervalId);
                    deferred.resolve(env);
                }
            }, (err) => {
                deferred.reject(err);
            });
    };
    repeat();
    return deferred.promise;
};

module.exports.followEnvProgress = followEnvProgress;
module.exports.findEnvByComposeName = findEnvByComposeName;