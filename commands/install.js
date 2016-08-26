'use strict';
var program = require('commander');
var utils   = require('../lib/utils');
var fs      = require('fs');
var git     = require('git');
var Q       = require('q');

var clone = function(urlInfo) {
    var deferred = Q.defer();

    console.log(urlInfo.toString());
    console.log("  cloning");

    fs.exists(urlInfo.name, function(exists) {
        if (exists) {
            console.log("  already cloned");
            // we probably already clone it, let's continue
            return deferred.resolve(urlInfo);
        }

        git.clone(urlInfo.toString(), urlInfo.name, function(err) {
            if (err) return deferred.reject(err);
            console.log("  cloned");
            deferred.resolve(urlInfo);
        });
    });

    return deferred.promise;
};

var checkout = function(urlInfo) {
    var deferred = Q.defer();

    console.log("  checkout " + urlInfo.sha);
    var repo = git(urlInfo.name);
    repo.checkout(urlInfo.sha, function(err) {
        if (err) return deferred.reject(err);

        console.log("  checkout");
        deferred.resolve(urlInfo);
    });

    return deferred.promise;
};

var save = function(urlInfo) {
    var deferred = Q.defer();

    var doSave = process.argv.shift();
    doSave = (doSave && doSave === "--save");

    if (doSave) {
        return utils.loadPackage()
            .then(function(pkg) {
                var repos = pkg.repos || {};
                pkg.repos = repos;

                repos[urlInfo.name] = urlInfo.toString() + ":" + urlInfo.sha;

                return utils.savePackage(pkg);
            });

    } else {
        deferred.resolve();
    }


    return deferred.promise;
};


var install = function(repoUrl) {
    return utils.gitUrlParse(repoUrl)
        .then(clone)
        .then(checkout)
        // TODO - do we need to pull ???
        .then(save);

};

var installAll = function() {
    return utils.loadPackage()
        .then(function (pkg) {
            var deferred = Q.defer();

            var repos = pkg.repos || {};

            var keys = Object.keys(repos);
            var index = 0;
            (function next() {
                if (index >= keys.length) {
                    deferred.resolve();
                    return;
                }
                var key = keys[index];
                var fullUrl = repos[key];
                index++;
                install(fullUrl).then(next);

            })();

            return deferred.promise;
        });
};

program
    .command('install')
    .description('install repos from package')
    .action(function(){
        installAll()
            .catch(function(err) {
                console.error(err);
            })
            .done(function() {
                console.log('All installed');
            });
    });

program
    .command('install <gitRepoUrl> [sha]')
    .description('install get repos ')
    .action(function(gitRepoUrl, sha){
        var gitSHA = sha || 'master';

        install(gitRepoUrl + ":" + gitSHA)
            .catch(function(err) {
                console.error(err);
            })
            .done(function() {
                console.log(gitRepoUrl + ' - installed');
            });
    });
