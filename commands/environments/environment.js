/**
 * Created by nikolai on 18.8.16.
 */
var _       = require('lodash');
var debug   = require('debug')('environment');

var urls = [];
var data;

var parseUrls = function (json) {
    if(json.instances) {
        _.each(json.instances, function (item) {
            _.each(item.urls, function (run) {
                _.each(run, function (url) {
                    urls.push(url.http.public);
                });
            });
        });
    }
};

function Environment (json, tempStatus) {
    debug('data:' + (json != null ? JSON.stringify(json) : json));
    if(tempStatus === 'pending' || tempStatus === 'terminating'){
        this.creationStatus = tempStatus;
    } else {
        data = json;
        this.creationStatus = json.creationStatus;
        this._id = json._id;
        if (this.creationStatus === 'done') {
            parseUrls(json);
        }
    }
}

Environment.prototype.getStatus = function () {
    return this.creationStatus;
};

Environment.prototype.getId = function () {
    return this._id;
};

Environment.prototype.getPublicUrls = function () {
    return urls;
};

var cleanInstances = function () {
    var instances = data.instances;
    _.each(instances, function (item) {
        delete item['dockerNode'];
        delete item['type'];
        delete item['container'];
    });
    return instances;
};

Environment.prototype.toString = function () {
    var body = {};
    body.instances = cleanInstances();
    body.created = data.created;
    body.duration = data.duration;
    body.status = this.creationStatus;
    body.name = data.name;
    body._id = this._id;
    return body;
};

module.exports.Environment = Environment;