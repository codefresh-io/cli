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
            deferred.resolve(new Pipeline.Pipeline(pipeline));
        }, function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

/**
 *
 * @param info - {url: '', repoName: '', repoOwner: '', token: ''}
 */
var getDefaultPipeline = function (info) {
    var deferred = Q.defer();

    var url = `${info.url}/api/services/${info.repoOwner}/${encodeURIComponent(info.repoName)}/default`;
    var headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(err);
        }
        deferred.resolve(new Pipeline.Pipeline(JSON.parse(body)));
    });
    return deferred.promise;
};

module.exports.getPipelineByName = getPipelineByName;
module.exports.getDefaultPipeline = getDefaultPipeline;
