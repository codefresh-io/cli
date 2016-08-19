/**
 * Created by nikolai on 11.8.16.
 * environments
 */
'use strict';

var debug       = require('debug')('cli-builds');
var _           = require('lodash');
//var request     = require('superagent-use');
var request     = require('request');

var prettyjson  = require('prettyjson');
var fs          = require('fs');
var Q          = require('q');
var path        = require('path');
var Environment = require('./environment');
var helper      = require('../../../helper/helper');

var idOperations = [
    'status', 'stop',
    'start', 'pause',
    'unpause', 'terminate'];

module.exports.get = function (info) {
    validate(info);
    let url = getUrl(info);

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
    }
};

var validate = function (info) {
    if(_.includes(idOperations, info.operation) && info.id == undefined) {
        throw new Error('Please, specify --id [id of a environment]');
    }

    if(info.operation == 'rename' && info.newName == undefined) {
        throw new Error('Please, specify --newName [the new name to assign to the environment]');
    }
};

var getUrl = function (info) {
    let url;
    if(info.id !== undefined) {
        url = `${info.url}/api/environments/${info.id}/${info.operation}`;
    } else {
        url = `${info.url}/api/environments`;
    }
    return url;
};

var getStatusEnv = function (info) {
    var deferred = Q.defer();
    console.log('info getStatusEnv:' + JSON.stringify(info));
    var url = `${info.url}/api/environments/${info.id}/status`,
        headers = {
            'Accept': 'application/json',
            'X-Access-Token': info.token
        };
    console.log('url:' + url + '; headers: ' + JSON.stringify(headers));
    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        console.log('status server httpRes:' + httpRes);
        if(err) {
            console.log('error getStatusEnv:' + err);
            deferred.reject(err);
        }
        console.log('env status:' + body);
        deferred.resolve(body);
    });
    return deferred.promise;
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
        if(body.length == 0) {
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