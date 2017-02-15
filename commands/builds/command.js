'use strict';

var Q           = require('q');
var request     = require('request');
var prettyjson  = require('prettyjson');
var pipelines   = require('../pipelines/command');
var repos       = require('../repos/command');
var Build       = require('./build');
var helper      = require('../../helper/helper');

var buildByService = function (info) {
    var deferred = Q.defer();
    var url = `${info.url}/api/builds/${info.pipelineId}`,
        headers = {
            'Content-Type':'application/json',
            'X-Access-Token': info.token
        };

    var payload = {
        branch: info.branch
    };

    if(info.sha) {
        payload.sha = info.sha;
    }
    request.post({url: url, headers: headers, json: payload},
        function (err, httpRes, body) {
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve(body);
        });
    return deferred.promise;
};

var getBuildById = function (info) {
    var deferred = Q.defer();

    var url = `${info.url}/api/builds/${info.buildId}`;
        var headers = {
            'Accept': 'application/json',
            'X-Access-Token': info.token
        };

    request.get({url: url, headers: headers}, function(err, httpRes, body) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve(new Build.Build(JSON.parse(body)));
    });
    return deferred.promise;
};

var followBuildProgress = function (data) {
    var deferred = Q.defer();
    process.stdout.write('Waiting ...');
    var intervalId = setInterval(function() { process.stdout.write('.'); }, 1000);
    var repeat = () => {
        getBuildById(data)
            .then((build) => {
                var status = build.getStatus();
                if(status === 'start' || status === 'pending' || status === 'elected') {
                    setTimeout(() => repeat(), 1000);
                } else {
                    process.stdout.write(' done!\n');
                    clearInterval(intervalId);
                    deferred.resolve(build);
                }
            }, (err) => {
                console.log('error:' + err);
                deferred.reject(err);
            });
    };
    repeat();
    return deferred.promise;
};

module.exports.build = function (info) {
    return (token) => {
        info.token = token;
        pipelines.getPipelineByName(info)
            .then(function (res) {
                info.pipelineId = res.getId();
                buildByService(info).then(function (res) {
                    info.buildId = res;

                    console.log(`Build url: ${info.url}/repositories/${info.repoOwner}/${encodeURIComponent(info.repoName)}/builds/${info.buildId}`);

                    followBuildProgress(info).then(function (res) {
                        console.log('Build Status: ' + res.getStatus());
                    }, (err) => {
                        throw new Error(err);
                    });
                }, (err) => {
                    throw new Error(err);
                });
            }, (err) => {
                throw new Error(err);
            });
    };
};

module.exports.buildDefaultPipeline = function (info) {
    return (token) => {
        info.token = token;
        // get default pipeline
        pipelines.getDefaultPipeline(info)
            .then(function (res) {
                info.pipelineName = res.getName();
                pipelines.getPipelineByName(info).then((res_pipeline_id) => {
                    info.pipelineId = res_pipeline_id.getId();
                    // get default branch of repo
                    repos.getRepo(info).then((res_repo) => {
                        if(!info.branch) {
                            info.branch = res_repo.getDefaultBranch();
                        }
                        // build pipeline
                        buildByService(info).then(function (res_service) {
                            info.buildId = res_service;

                            console.log(`Build url: ${info.url}/repositories/${info.repoOwner}/${encodeURIComponent(info.repoName)}/builds/${info.buildId}`);

                            followBuildProgress(info).then(function (res_progress) {
                                console.log('Build Status: ' + res_progress.getStatus());
                            }, (err) => {
                                throw new Error(err);
                            });
                        }, (err) => {
                            throw new Error(err);
                        });
                    }, (err) => {
                        throw new Error(err);
                    });
                }, (err) => {
                    throw new Error(err);
                });
            }, (err) => {
                throw new Error(err);
            });
    };
};

module.exports.getAll = function(info) {
    let buildUrl = info.targetUrl;
    return (token) => {
        var deferred = Q.defer();

        var headers = {
                'Accept': 'application/json',
                'X-Access-Token': token
            };

        request.get({url: buildUrl, headers: headers}, function(err, httpRes, body) {
            if (err) {
                deferred.reject(err);
            }

            if(info.tofile) {
                helper.toFile(info.tofile, (helper.IsJson(body) ? JSON.parse(body) : body));
                deferred.resolve(prettyjson.render(body));
            } else if(info.table) {
                if(helper.IsJson(body)) {
                    var builds = JSON.parse(body);
                    helper.toTable("build", builds, Build.getHeader());
                    deferred.resolve(prettyjson.render(body));
                } else {
                    console.log('Body:' + JSON.stringify(body));
                    deferred.resolve(prettyjson.render(body));
                }
            } else {
                console.log('Body:' + JSON.stringify(body));
                deferred.resolve(prettyjson.render(body));
            }
        });
        return deferred.promise;
    };
};