/**
 * Created by nikolai on 18.8.16.
 */
var _ = require('lodash');

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

function Environment (json) {
    data = json;
    this.creationStatus = json.creationStatus;
    this._id = json._id;
    parseUrls(json);
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

Environment.prototype.toString = function () {
    var body = {};
    body._id = this._id;
    body.status = this.creationStatus;
    body.urls = urls;
    body.name = data.name;
    body.created = data.created;
    body.duration = data.duration;
    return body;
};

module.exports.Environment = Environment;