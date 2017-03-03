/**
 * Created by nikolai on 12.8.16.
 */
'use strict';
var debug       = require('debug')('images');
var request     = require('request');
var _           = require('lodash');
var prettyjson  = require('prettyjson');
var Q           = require('q');
var helper      = require('../../helper/helper');
var Image       = require('./image');
var Environments = require('../environments/command');

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
        helper.toTable("image", body, Image.getHeader());
        return prettyjson.render(body);
    }

    console.log('Response body:' + prettyjson.render(body));
    return body;
};

module.exports.get = function (info) {
    let url = info.targetUrl;

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

            deferred.resolve(outputTo(body, info));
        });
        return deferred.promise;
    };
};

module.exports.getTags = function (info) {
    let url = info.targetUrl;

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
                console.log('Response body:\n' + prettyjson.render(helper.IsJson(body) ? JSON.parse(body) : body));
            }
            deferred.resolve(body);
        });
        return deferred.promise;
    };
};

var getImageByName = function (info, token) {
    var deferred = Q.defer();
    var imageName = info.name;
    var sha = info.sha;

    var url = `${info.url}/api/images`,
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Access-Token': token
        };

    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        if(err) {
            debug('error image:' + err);
            deferred.reject(err);
        }

        debug('body image:' + body);

        if (!body || body.length === 0 || !helper.IsJson(body)) {
            deferred.reject('Please, check the imageName , sha and try again.');
        }

        var res = _.find(JSON.parse(body), (obj) => {
            debug('imagename:' + obj.imageName + '; sha:' + obj.sha);
            return obj.imageName === imageName && obj.sha.startsWith(sha);
        });


        if(!res || !res.imageName) {
            deferred.reject('Please, check the imageName , sha and try again.');
        } else {
            debug('image:' + JSON.stringify(res));
            deferred.resolve(new Image.Image(res));
        }
    });
    return deferred.promise;
};

var runImage = function (info, token) {
    var p = new Promise((resolve, reject) => {
        let url = `${info.url}/api/runtime/testit`;
        debug('run image url:' + url);
        var headers = {
            'Accept': 'application/json',
            'Content-Type':'application/x-www-form-urlencoded',
            'X-Access-Token': token
        };

        var form = {
            imageId: info.id
        };

        request.post({url: url, headers: headers, form: form},
            function (err, httpRes, body) {
                if (err) {
                    reject(err);
                }

                debug('image body:' + body);

                if (!body || body.length === 0 || !helper.IsJson(body)) {
                    reject('Please, check the imageName , sha and try again.');
                }

                if(JSON.parse(body).status && JSON.parse(body).status !== 200) {
                    reject(JSON.stringify(body));
                }

                resolve(JSON.parse(body));
            });
    });

    return p;
};

module.exports.run = function (info) {
    return (token) => {
        process.stdout.write('Pending ...');
        var intervalId = setInterval(function() { process.stdout.write('.'); }, 1000);
        getImageByName(info, token).then((image) => {
            debug('imageid:' + image.getId());
            info.id = image.getId();
            clearInterval(intervalId);
            runImage(info, token).then((progress_id) => {
                debug('progress_id:' + progress_id.id);
                info.progress_id = progress_id.id;
                Environments.followEnvProgress({
                    url: info.url,
                    token: token,
                    nameCompose: `Image - ${info.name}`
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
            clearInterval(intervalId);
            console.log(err);
            throw new Error(err);
        });
    };
};