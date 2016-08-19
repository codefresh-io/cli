/**
 * Created by nikolai on 12.8.16.
 */
'use strict';

var debug       = require('debug')('cli-builds');
var _           = require('lodash');
var request     = require('request');
var prettyjson  = require('prettyjson');
var fs          = require('fs');
var Q           = require('q');
var path        = require('path');
var helper      = require('../../helper/helper');

var idOperations = ['get'];

module.exports.get = function (info) {
    validate(info);
    let url = getUrl(info);

    return (token) => {
        console.log('url:' + url);
        var deferred = Q.defer();
        var headers = {
            'Accept': 'application/json',
            'Content-Type':'application/json',
            'X-Access-Token': token
        };

        request.get({url: url, headers: headers}, function (err, httpRes, body) {
            if (err) {
                deferred.reject(err);
            }

            if(info.tofile) {
                helper.toFile(info.tofile, body);
            } else {
                console.log('Response body:' + prettyjson.render(body));
                deferred.resolve(body);
            }
        });
        return deferred.promise;

        //var p = new Promise((resolve, reject) => {
        //    request
        //        .get(url)
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
        //            if(info.toFile !== undefined) {
        //                console.log('tofile:' + info.toFile);
        //                writeResults(info.toFile, res.body).then((res) => {
        //                    resolve(res);
        //                }).catch((err) => {
        //                    throw err;
        //                });
        //            } else {
        //                console.log(prettyjson.render(res.body));
        //                resolve(res.body);
        //            }
        //        });
        //}).catch((err) => {
        //        throw err;
        //    });
        //return p;
    }
};

var validate = function (info) {
    if(_.includes(idOperations, info.operation) && info.id == undefined) {
        throw new Error('Please, specify --id [id of the image]');
    }

    if(info.operation == 'getTags' && info.imageName == undefined) {
        throw new Error('Please, specify --imageName [name of image]');
    }
};

var getUrl = function (info) {
    let url;
    if(info.id !== undefined) {
        url = `${info.url}/api/images/${info.id}`;
    } else if(info.imageName !== undefined) {
        url = `${info.url}/api/images/${encodeURIComponent(info.imageName)}/tags`;
    } else {
        url = `${info.url}/api/images`;
    }
    return url;
};