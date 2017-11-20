/**
 * Created by nikolai on 24.8.16.
 */

function Pipeline (data) {
    this.name = data.name;
    this._id = data._id;
}

Pipeline.prototype.getId = function () {
    return this._id;
};

module.exports.Pipeline = Pipeline;