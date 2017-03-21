/**
 * Created by nikolai on 2/15/17.
 *
 */
var request     = require('request');
var Q           = require('q');
var Repo    = require('./repo');

/**
 *
 * @param info - {url: '', repoName: '', repoOwner: '', token: ''}
 */
var getRepo = function (info) {
    var deferred = Q.defer();

    var url = `${info.url}/api/repos/${info.repoOwner}/${encodeURIComponent(info.repoName)}`;
    var headers = {
        'Accept': 'application/json',
        'X-Access-Token': info.token
    };
    request.get({url: url, headers: headers}, function (err, httpRes, body) {
        if(err) {
            deferred.reject(err);
        }
        deferred.resolve(new Repo.Repo(JSON.parse(body)));
    });
    return deferred.promise;
};

module.exports.getRepo = getRepo;
