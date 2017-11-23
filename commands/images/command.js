/**
 * Created by nikolai on 12.8.16.
 */
'use strict';
var request     = require('request');
var prettyjson  = require('prettyjson');
var Q           = require('q');
var helper      = require('../../helper/helper');
var Image       = require('./image');

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

    if(info.list && isJson) {
        helper.toList("image", body, Image.getHeader());
        return;
    }

    console.log('Response body:' + prettyjson.render(body));
    return body;
};

module.exports.get = function (info) {
    let url = info.targetUrl;

    return (token) => {
        var deferred = Q.defer();
        var headers = {
            'Accept': 'application/json',
            'Content-Type':'application/json',
            'X-Access-Token': token
        };
        var query = {
            metadata: info.annotation,
            sha: info.sha
        };

        request.get({url: url, headers: headers, qs: query}, function (err, httpRes, body) {
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