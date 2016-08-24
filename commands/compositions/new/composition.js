/**
 * Created by nikolai on 18.8.16.
 */
'use strict';

function Composition(data) {
    var json = JSON.parse(data);
    this._id = json._id;
    this.name = json.name;
}

Composition.prototype.getName = function () {
    return this.name;
};

module.exports.Composition = Composition;