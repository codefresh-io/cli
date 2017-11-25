/**
 * Created by nikolai on 9/16/16.
 */
var chalk   = require('chalk');

function Workflow(data) {
    this.status = data.status;
    this.repoOwner = data.userName;
    this.repoName = data.serviceName;
    this._id = data.id;
}

Workflow.prototype.getStatus = function () {
    return this.status;
};

Workflow.prototype.toJson = function () {
    var obj = {};
    obj.id = this._id;
    obj.repository = this.repoName;
    obj.owner = this.repoOwner;
    obj.status = this.status;
    obj.type = "workflow";
    return obj;
};

var header = [
    {
        value : "id",
        headerColor : "cyan",
        color: "white",
        align : "left",
        paddingLeft : 5,
        width : 10
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
    }
];

var getHeader = function () {
    return header;
};

module.exports.Workflow = Workflow;
module.exports.getHeader = getHeader;

