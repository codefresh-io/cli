/**
 * Created by nikolai on 2.9.16.
 */
var _ = require('lodash');

function User(data) {
    this.username = 'unknown';
    this.provider = 'unknown';
    this.url = 'unknown';
    if(data.shortProfile) {
        if (data.shortProfile.userName)
            this.username = _.get(data, 'shortProfile.userName'); //data.shortProfile.userName;
        if (data.shortProfile.provider)
            this.provider = _.get(data, 'shortProfile.provider.name'); //data.shortProfile.provider.name;
    }
}

User.prototype.setUrl = function (url) {
    this.url = url;
};

User.prototype.getUserName = function () {
    return this.username;
};

User.prototype.toString = function () {
    var info = {
        username: this.username,
        provider: this.provider,
        url: this.url
    };
    return info;
};

module.exports.User = User;