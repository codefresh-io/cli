/**
 * Created by nikolai on 12.8.16.
 */
'use strict';


var _           = require('lodash');
var request     = require('request');
var prettyjson  = require('prettyjson');
var Q           = require('q');
var helper      = require('../../helper/helper');

var idOperations = ['get'];

var validate = function (info) {
    if(_.includes(idOperations, info.operation) && info.id === undefined) {
        throw new Error('Please, specify --id [id of the image]');
    }

    if(info.operation === 'getTags' && info.imageName === undefined) {
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
    };
};