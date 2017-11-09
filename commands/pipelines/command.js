/**
 * Created by nikolai on 24.8.16.
 */

var _           = require('lodash');
var request     = require('request');
var Q           = require('q');
var Pipeline    = require('./pipeline');


/**
 *
 * @param info = {url: '', repoName: '', repoOwner: '', token: ''}
 * @returns {*|promise}
 */
var getAllByUser = function (info) {
    var deferred = Q.defer();
    var url = `${info.url}/api/services/${info.repoOwner}/${encodeURIComponent(info.repoName)}`;
    var headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(err);
        }
        deferred.resolve(body);
    });
    return deferred.promise;
};

/**
 *
 * @param info - {url: '', repoName: '', repoOwner: '', pipelineName: '', token: ''}
 */
var getPipelineByName = function (info) {
    var deferred = Q.defer();
    getAllByUser(info)
        .then(function (res) {
            var pipeline = _.find(JSON.parse(res), {name: info.pipelineName});
            if(!pipeline) {
                deferred.reject(
                    new Error(`Pipeline with name ${info.pipelineName} wasn't found for owner ${info.repoOwner} and repo ${info.repoName}.`));
            }
            else {
                deferred.resolve(new Pipeline.Pipeline(pipeline));
            }
        }, function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};




var executePipeline = function (info) {
    var deferred = Q.defer();
    if (typeof info.pipelineName !== "undefined" && typeof info.repoName !== "undefined" && typeof info.repoOwner !== "undefined"){
        getPipelineByName(info).then((res) => {
           deferred.resolve(executePipelineById(info,res._id));
       }).catch((err) =>{
            deferred.reject(err);
        });
    }
    else if (typeof info.pipelineId !== "undefined"){
        deferred.resolve(executePipelineById(info,info.pipelineId));
    }
    else {
        deferred.reject(new Error("you must provide [pipelineid] or [pipelineName] [repoName] [repoOwner]"));
    }
    return deferred.promise;
};


var executePipelineById = function (info,pipelineId) {
    var deferred = Q.defer();
    var url = `${info.url}/api/builds/${pipelineId}`;
    var headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    var payload = {
        branch: info.branch,
        options: {noCache:info.noCache,resetVolume:info.resetVolume},
        variables: extractVariables(info)
    };
    request.post({url: url, headers: headers , json:payload}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(err);
        }
        deferred.resolve(body);
    });
    return deferred.promise;
};


function extractVariables(info) {
    var variables = {};
    for (var i = 0; i < info.variables.length-1; i++) {
        var key = info.variables[i];
        var val = info.variables[i+1];
        variables[key] = val.toString();
        i++;
    }
    return variables;
}


module.exports.getPipelineByName = getPipelineByName;
module.exports.getAllByUser = getAllByUser;
module.exports.executePipeline = executePipeline;
