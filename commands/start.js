var utils   = require('../lib/utils'),
    fs      = require('fs'),
    path      = require('path'),
    Q       = require('q'),
    spawn   = require('child_process').spawn,
    Generator = require('../lib/templateGenerator');

var tempPath = path.resolve(process.cwd(), 'temp');
var name = path.basename(process.cwd());

var createFromTemplate= function(package) {
    var generator = new Generator(package, {path:tempPath});
    return generator.process()
        .then(function() {
            return package;
        });
};

var rmDockerCompose = function(package) {
    var deferred = Q.defer();

    var options = {
        cwd: tempPath,
        stdio: 'pipe'
    };

    var child = spawn('docker-compose', ['-p', name, 'rm', '--force'], options);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stdout);

    process.stdin.pipe(child.stdin);

    child.on('close', function (code) {
        if (code === 0) {
            return deferred.resolve(package);
        }
        console.log('child process exited with code ' + code);
        deferred.reject(code);
    });

    return deferred.promise;
};

var upDockerCompose = function(package) {
    var deferred = Q.defer();

    var options = {
        cwd: tempPath,
        stdio: ['pipe', 'pipe', 'pipe']
    };

    var child = spawn('docker-compose', ['-p', name, 'up', '-d'], options);

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stdout);

    process.stdin.pipe(child.stdin);


    /*
    child.stdout.on('data', function (data) {
        console.log(''+data);
    });

    child.stderr.on('data', function (data) {
        console.error(''+data);
    });
*/
    child.on('close', function (code) {
        if (code !== 0) {
            console.log('child process exited with code ' + code);
        }
        process.exit(code)
    });

    return deferred.promise;
};

utils.loadPackage()
    .then(createFromTemplate)
    .then(rmDockerCompose)
    .then(upDockerCompose);