/**
 * Created by nikolai on 9/19/16.
 */
var _       = require('lodash');

var getTags = function (data) {
    var tags = "";
    var keys = _.keys(data.tags);
    for(var index in keys) {
        var tag = data.tags[keys[index]];
        tags+=(tag.name + "\n");
    }
    return tags;
};

function Image(data) {
    this._id = data._id;
    this.status = data.status;
    this.imageName = data.imageName;
    this.created = data.created;
    this.tags = getTags(data);
}

Image.prototype.toJson = function () {
    var obj = {};
    obj.id = this._id;
    obj.imageName = this.imageName;
    obj.created = this.created;
    obj.tags = this.tags || "untagged";
    obj.status = this.status;
    return obj;
};

var header = [
    {
        value : "id",
        headerColor : "cyan",
        color: "white",
        align : "left",
        width : 48
    },
    {
        value : "imageName",
        color : "white",
        width : 40,
    },
    {
        value : "created",
        color : "white",
        width : 30,
    },
    {
        value : "tags",
        color : "white",
        width : 25,
    },
    {
        value : "status",
        width : 15,
        color : "white"
    }
];

var getHeader = function () {
    return header;
};

module.exports.Image = Image;
module.exports.getHeader = getHeader;
