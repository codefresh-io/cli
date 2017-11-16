/**
 * Created by nikolai on 24.8.16.
 */
var chalk   = require('chalk');

function Build(data) {
    this.status = data.status;
    this.repoOwner = data.repoOwner;
    this.repoName = data.repoName;
    this._id = data._id;
}

Build.prototype.getStatus = function () {
    return this.status;
};

Build.prototype.toJson = function () {
    var obj = {};
    obj.id = this._id;
    obj.repository = this.repoName;
    obj.owner = this.repoOwner;
    obj.status = this.status;
    obj.type = "build";
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
        value : "repository",
        color : "white",
        width : 20,
    },
    {
        value : "owner",
        color : "white",
        width : 20,
    },
    {
        value : "status",
        width : 15,
        formatter : function(value){
            if(value === 'success'){
                value = chalk.black.bgGreen(value);
            }
            else{
                value = chalk.white.bgRed(value);
            }
            return value;
        }
    },
    {
        value : "type",
        color : "white",
        width : 20,
    },
];

var getHeader = function () {
    return header;
};

module.exports.Build = Build;
module.exports.getHeader = getHeader;

