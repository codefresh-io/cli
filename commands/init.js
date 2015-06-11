var program = require('commander'),
    path    = require('path'),
    fs      = require('fs'),
    utils   = require('../lib/utils');

program
    .command('init ')
    .description('initialize new project')
    .action(function(){
        var PACKAGE_FILE_NAME = "package.json";

        var name = path.basename(process.cwd());

        var package = {
            "name": name,
            "version": "0.0.1",
            "description": name,
            "scripts": {
            }
        };

        fs.exists(PACKAGE_FILE_NAME, function(exists) {

            if (exists) {
                // TODO - what we want to do here ????
            }

            utils.savePackage(package)
                .catch(function(err) {
                    console.error(err);
                });
        });
    });





