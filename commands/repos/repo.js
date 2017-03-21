/**
 * Created by nikolai on 2/15/17.
 *
 */
function Repo (data) {
    this.name = data.name;
    this._id = data._id;
    this.default_branch = data.default_branch;
}

Repo.prototype.getId = function () {
    return this._id;
};

Repo.prototype.getDefaultBranch = function () {
    return this.default_branch;
};

module.exports.Repo = Repo;