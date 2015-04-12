var Q           = require('q'),
    fs          = require('fs'),
    path        = require('path'),
    url         = require('url'),
    request     = require('request');

var LOCAL_SETTINGS = ".codefresh";

var getLocalSettings = function() {
    var deferred = Q.defer();

    fs.exists(LOCAL_SETTINGS, function(exists) {
        if (!exists) {
            return deferred.reject(new Error('could not find local settings'));
        }

        fs.readFile(LOCAL_SETTINGS, function(err, data) {
            if (err) return deferred.reject(err);

            var settings = JSON.parse(data);
            deferred.resolve(settings);
        });
    });

    return deferred.promise;
};


var API_CALL = function(options) {
    return getLocalSettings()
        .then(function(settings) {
            var deferred = Q.defer();

            var method = options.method || 'GET';
            var requestOptions = {
                method: method,
                url: url.resolve(settings.api.url, options.api),
                form: options.data,
                headers: {
                    "x-access-token": settings.token
                }
            };

//            console.log(JSON.stringify(requestOptions, null, 2));

            request(requestOptions, function(error, response, body) {
                if (error) {
                    return deferred.reject(error);
                }

                if (response.statusCode !== 200) {
                    return deferred.reject(new Error('got error code ' + response.statusCode));
                }

                if (options.raw) {
                    deferred.resolve(body);

                } else {
                    var obj = JSON.parse(body);
                    deferred.resolve(obj);
                }
            });

            return deferred.promise;
        });
};

var api = {
    environments: {
        list : function() {
            return API_CALL({
                api:'environments'
            });
        },
        status: function(envId) {
            return API_CALL({
                api:'environments/' + envId + '/status',
                raw:true
            });
        },
        terminate: function(envId) {
            return API_CALL({
                api:'environments/' + envId + '/terminate',
                raw:true
            });
        },
        stop: function(envId) {
            return API_CALL({
                api:'environments/' + envId + '/stop',
                raw:true
            });
        },
        start: function(envId) {
            return API_CALL({
                api:'environments/' + envId + '/start',
                raw:true
            });
        }
    },
    notifications: {
        list: function() {
            return API_CALL({
                api:'notifications'
            });
        }
    },
    repos: {
        list: function() {
            return API_CALL({
                api:'repos'
            });
        },
        show: function(repo_id) {
            return API_CALL({
                api:'repos/' + repo_id + '/full_data'
            });
        },
        branches: function(repo_id) {
            return API_CALL({
                api:'repos/' + repo_id + '/branches-data'
            });
        }
    },
    runtime: {
        start: function(options) {
            return API_CALL({
                method:'POST',
                api:'runtime/codeit',
                data: options
            })
        },
        progress: function(progress_id) {
            return API_CALL({
                api:'runtime/codeit/progress/' + progress_id
            });
        }
    }
};

module.exports = api;