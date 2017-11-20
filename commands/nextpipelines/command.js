/**
 * Created by nikolai on 24.8.16.
 */

const request     = require('request');
const Promise     = require('bluebird');
const CFError     = require('cf-errors');
const YAML        = require('yamljs');


const getPipelines = function (info) {
    const url =`${info.url}/api/pipelines/next-gen`;
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



module.exports.getPipelines = getPipelines;

