/**
 * Created by nikolai on 24.8.16.
 */

const _           = require('lodash');
const request     = require('request');
const Q           = require('q');
const Pipeline    = require('./pipeline');
const CFError     =require('cf-errors');


/**
 *
 * @param info = {url: '', repoName: '', repoOwner: '', token: ''}
 * @returns {*|promise}
 */
const getAllByUser = function (info) {
    let deferred = Q.defer();
    let url = `${info.url}/api/services/${info.repoOwner}/${encodeURIComponent(info.repoName)}`;
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(new CFError(err));
        }
        deferred.resolve(body);
    });
    return deferred.promise;
};

/**
 *
 * @param info - {url: '', repoName: '', repoOwner: '', pipelineName: '', token: ''}
 */
const getPipelineByName = function (info) {
    let deferred = Q.defer();
    getAllByUser(info)
        .then(function (res) {
            var pipeline = _.find(JSON.parse(res), {name: info.pipelineName});
            if(!pipeline) {
                deferred.reject(
                    new CFError(`Pipeline with name ${info.pipelineName} wasn't found for owner ${info.repoOwner} and repo ${info.repoName}.`));
            }
            else {
                deferred.resolve(new Pipeline.Pipeline(pipeline));
            }
        }, function (err) {
            deferred.reject(new CFError(err));
        });
    return deferred.promise;
};




const executePipeline = function (info) {
    let deferred = Q.defer();
    if (!_.isUndefined(info.pipelineName) && !_.isUndefined(info.repoName) && !_.isUndefined(info.repoOwner)){
        getPipelineByName(info).then((res) => {
           deferred.resolve(executePipelineById(info,res._id));
       }).catch((err) =>{
            deferred.reject(new CFError(err));
        });
    }
    else if (!_.isUndefined(info.pipelineId)){
        deferred.resolve(executePipelineById(info,info.pipelineId));
    }
    else {
        deferred.reject(new CFError("you must provide [pipelineid] or [pipelineName] [repoName] [repoOwner]"));
    }
    return deferred.promise;
};


const executePipelineById = function (info,pipelineId) {
    let deferred = Q.defer();
    let url = `${info.url}/api/builds/${pipelineId}`;
    let headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    let payload = {
        branch: info.branch,
        options: {noCache:info.noCache,resetVolume:info.resetVolume},
        variables: extractVariables(info)
    };
    request.post({url: url, headers: headers , json:payload}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(new CFError(err));
        }
        deferred.resolve(body);
    });
    return deferred.promise;
};


function extractVariables(info) {
    let variables = {};
    let length = info.variables.length;
    if (length % 2 ===1){
        console.log('invalid environment variables please enter [key] [value]');
        length -=1;
    }
    for (let i = 0; i < length; i++) {
        let key = info.variables[i];
        let val = info.variables[i+1];
        variables[key] = val.toString();
        i++;
    }
    return variables;
}


module.exports.getPipelineByName = getPipelineByName;
module.exports.getAllByUser = getAllByUser;
module.exports.executePipeline = executePipeline;
