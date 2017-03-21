/**
 * Created by nikolai on 24.8.16.
 */

function Pipeline (data) {
    this.name = data.name;
    if(data._id)
        this._id = data._id;
}

Pipeline.prototype.getId = function () {
    return this._id;
};

Pipeline.prototype.getName = function () {
    return this.name;
};

module.exports.Pipeline = Pipeline;