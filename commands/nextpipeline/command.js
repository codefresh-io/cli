const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');
const YAML        = require('yamljs');
const _           = require('lodash');


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

const createOrReplacePipelineByFile = function (info) {
    let requestData= YAML.load(info.file);
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

const deletePipeline = function (info) {
    let url;
    let requestData;
    if (_.isUndefined(info.name)) {
        url = `${info.url}/api/pipelines/next-gen`;
        requestData = YAML.load(info.file);
    }
    else{
        url =`${info.url}/api/pipelines/next-gen/${info.name}`;
        requestData='';
    }
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




module.exports.getPipelineByName = getPipelineByName;
module.exports.deletePipeline = deletePipeline;
module.exports.createOrReplacePipelineByFile = createOrReplacePipelineByFile;

