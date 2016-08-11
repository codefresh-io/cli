/**
 * Created by nikolai on 11.8.16.
 */
'use strict';

var debug       = require('debug')('cli-builds');
var _           = require('lodash');
var request     = require('superagent-use');
var prettyjson  = require('prettyjson');
var fs          = require('fs');
var path        = require('path');

var idOperations = [
    'status', 'stop',
    'start', 'pause',
    'unpause', 'terminate', 'rename'];

module.exports.get = function (info) {
    validate(info);
    let url = getUrl(info);

    return (token) => {
        console.log('url:' + url);
        var p = new Promise((resolve, reject) => {
            request
                .get(url)
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
                throw err;
            });
        return p;
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