const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');
const YAML        = require('yamljs');
const _           = require('lodash');


const getContextByName = function (info) {
    const url =`${info.url}/contexts/${info.authorization}/${info.name}`;
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


const createOrReplaceContextByFile = function (info) {
    let requestData;
    return new Promise(function (resolve,reject) {
    try{
        requestData = YAML.load(info.file);
    }catch(err) {
        return reject(new CFError("yaml path are illegal"));
    }
    const url =`${info.url}/contexts/${info.authorization}`;
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
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



const deleteContext = function (info) {
    let url;
    let requestData;
    return new Promise(function (resolve,reject) {
        if (_.isUndefined(info.name)) {
            url =`${info.url}/contexts/${info.authorization}`;
            try{
                requestData = YAML.load(info.file);
            }catch(err) {
                return reject(new CFError("yaml path are illegal"));
            }
        }
        else{
            url = `${info.url}/contexts/${info.authorization}/${info.name}`;
            requestData='';
        }
        let headers = {
            'Accept': 'application/json',
            'X-Access-Token': info.token
        };
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


module.exports.getContextByName = getContextByName;
module.exports.createOrReplaceContextByFile = createOrReplaceContextByFile;
module.exports.deleteContext = deleteContext;
