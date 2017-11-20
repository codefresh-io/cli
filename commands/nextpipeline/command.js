const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');
const YAML        = require('yamljs');


const getPipelineByName = function (info) {
    const url =`${info.url}/api/pipelines/next-gen/${info.name}`;
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

const deletePipelineByName = function (info) {
    const url =`${info.url}/api/pipelines/next-gen/${info.name}`;
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

const createPipelineByFile = function (info) {
    const requestData = YAML.load(info.file);
    let url = `${info.url}/api/pipelines/next-gen`;
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

const deletePipelineByFile = function (info) {
    const requestData = YAML.load(info.file);
    let url = `${info.url}/api/pipelines/next-gen`;
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

const replacePipelineByFile = function (info) {
    const requestData = YAML.load(info.file);
    let url = `${info.url}/api/pipelines/next-gen`;
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



module.exports.getPipelineByName = getPipelineByName;
module.exports.deletePipelineByName = deletePipelineByName;
module.exports.createPipelineByFile = createPipelineByFile;
module.exports.deletePipelineByFile = deletePipelineByFile;
module.exports.replacePipelineByFile = replacePipelineByFile;
