/**
 * Created by nikolai on 24.8.16.
 */

function Build(data) {
    this.status = data.status;
    this.repoOwner = data.repoOwner;
    this.repoName = data.repoName;
    this._id = data._id;
}

Build.prototype.getStatus = function () {
    return this.status;
};

module.exports.Build = Build;

