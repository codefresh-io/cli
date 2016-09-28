/**
 * Created by nikolai on 18.8.16.
 */
'use strict';

function Composition(data) {
    this._id = data._id;
    this.name = data.name;
    this.created = data.created;
}

Composition.prototype.getName = function () {
    return this.name;
};

Composition.prototype.toJson = function () {
    var obj = {};
    obj.id = this._id;
    obj.name = this.name;
    obj.created = this.created;
    return obj;
};

var header = [
    {
        value : "id",
        headerColor : "cyan",
        color: "white",
        align : "left",
        width : 30
    },
    {
        value : "name",
        color : "white",
        width : 30,
    },
    {
        value : "created",
        color : "white",
        width : 40,
    }
];

var getHeader = function () {
    return header;
};

module.exports.getHeader = getHeader;
module.exports.Composition = Composition;