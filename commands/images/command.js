/**
 * Created by nikolai on 12.8.16.
 */
'use strict';

var debug       = require('debug')('cli-builds');
var _           = require('lodash');
var request     = require('superagent-use');
var prettyjson  = require('prettyjson');
var fs          = require('fs');
var path        = require('path');

var idOperations = ['get'];

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

                    if(info.toFile !== undefined) {
                        console.log('tofile:' + info.toFile);
                        writeResults(info.toFile, res.body).then((res) => {
                            resolve(res);
                        }).catch((err) => {
                            throw err;
                        });
                    } else {
                        console.log(prettyjson.render(res.body));
                        resolve(res.body);
                    }
                });
        }).catch((err) => {
                throw err;
            });
        return p;
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

var writeResults = function(pathToFile, content) {
    var fs = require('fs');
    var p = new Promise((resolve, reject) => {
        fs.writeFile(pathToFile , JSON.stringify(content), (err) => {
            if (err) {
                console.log('error:' + err);
                return reject(err);
            }
            console.log('It\'s saved!');
            resolve(content);
        });

    });

    return p;
};