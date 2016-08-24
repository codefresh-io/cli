/**
 * Created by nikolai on 19.8.16.
 */
var fs = require('fs');

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

module.exports.toFile = toFile;
module.exports.IsJson = IsJson;