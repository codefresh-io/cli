/**
 * Created by nikolai on 24.8.16.
 */

const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');
const YAML        = require('yamljs');


const getContextByName = function (info) {
    let url = "";//need to ask arik
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    return new Promise(function (resolve,reject) {
        request.get({url: url, headers: headers}, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};

const deleteContextByName = function (info) {
    let url = "";//need to ask arik
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    return new Promise(function (resolve,reject) {
        request.del({url: url, headers: headers}, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};

const createContextByFile = function (info) {
    const requestData = YAML.load(info.file);
    let url = "";//need to ask arik
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    return new Promise(function (resolve,reject) {
        request({
            url: url,
            method: "POST",
            headers: headers,
            json: requestData
        }, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};

const deleteContextByFile = function (info) {
    const requestData = YAML.load(info.file);
    let url = "";//need to ask arik
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    return new Promise(function (resolve,reject) {
        request({
            url: url,
            method: "DELETE",
            headers: headers,
            json: requestData
        }, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};

const replaceContextByFile = function (info) {
    const requestData = YAML.load(info.file);
    let url = "";//need to ask arik
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    return new Promise(function (resolve,reject) {
        request({
            url: url,
            method: "POST",
            headers: headers,
            json: requestData
        }, function (err, httpRes, body) {
            if(err) {
                return reject(new CFError(err));
            }
            return resolve(body);
        });
    })
};



module.exports.getContextByName = getContextByName;
module.exports.deleteContextByName = deleteContextByName;
module.exports.createContextByFile = createContextByFile;
module.exports.deleteContextByFile = deleteContextByFile;
module.exports.replaceContextByFile = replaceContextByFile;
