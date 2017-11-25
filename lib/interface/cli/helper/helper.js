/**
 * Created by nikolai on 19.8.16.
 */
var fs      = require('fs');
var _       = require('lodash');
var Table   = require('tty-table');
var Build   = require('../commands/builds/build');
var Workflow = require('../commands/builds/workflow');
var Image    = require('../commands/images/image');
var Composition = require('../commands/compositions/new/composition');

var IsJson = function (str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

var toFile = function(pathToFile, content) {
    var p = new Promise((resolve, reject) => {
        fs.writeFile(pathToFile , JSON.stringify(content), (err) => {
            if (err) {
                console.log('error:' + err);
                return reject(err);
            }
            console.log(`Output was saved to file ${pathToFile}`);
            resolve(content);
        });

    });
    return p;
};

var generateRows = function(type, array) {
    var rows = [];
    switch (type) {
        case "build":
            var workflows = array.workflows;
            if(workflows) {
                _.each(workflows.docs, function (item) {
                    rows.push(new Workflow.Workflow(item).toJson());
                });
            }

            var builds = array.builds;
            if(builds) {
                _.each(builds.docs, function (item) {
                    rows.push(new Build.Build(item).toJson());
                });
            }
            break;
        case "image":
            if(Array.isArray(array)) {
                _.each(array, function (item) {
                    rows.push(new Image.Image(item).toJson());
                });
            } else {
                rows.push(new Image.Image(array).toJson());
            }
            break;
        case "composition":
            if(Array.isArray(array)) {
                _.each(array, function (item) {
                    rows.push(new Composition.Composition(item).toJson());
                });
            } else {
                rows.push(new Composition.Composition(array).toJson());
            }
            break;
    }
    return rows;
};

var toTable = function (type, array, header) {
    var rows = generateRows(type, array);
    var footer = [];

    var table = Table(header, rows, footer, {
        borderStyle : 1,
        borderColor : "blue",
        paddingBottom : 0,
        headerAlign : "center",
        align : "center",
        color : "white"
    });

    var output = table.render();
    console.log(output);
};

var toList = function (type, array) {
    _.forEach(array, (row) => {
        const image = new Image.Image(row);
        console.log(image.toString());
    });
};

module.exports.toFile = toFile;
module.exports.IsJson = IsJson;
module.exports.toTable = toTable;
module.exports.toList = toList;