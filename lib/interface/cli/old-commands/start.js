'use strict';
var program = require('commander');

program
    .command('start [env]')
    .description('run setup commands for all envs')
    .option("-s, --setup_mode [mode]", "Which setup mode to use")
    .action(function(env, options){
        var mode = options.setup_mode || "normal";
        env = env || 'all';
        console.log('setup for %s env(s) with %s mode', env, mode);
    });

var utils   = require('../lib/utils'),
    path      = require('path'),
    Q       = require('q'),
    spawn   = require('child_process').spawn,
    Generator = require('../lib/templateGenerator');

var tempPath = path.resolve(process.cwd(), 'temp');
var rootPath = path.resolve(__dirname, '../..');

var name = path.basename(process.cwd());

var createFromTemplate= function(pkg) {
    pkg.rootPath = rootPath;
    var generator = new Generator(pkg, { path:tempPath });

    return generator.process()
        .then(function() {
            return pkg;
        });
};

var rmDockerCompose = function(pkg) {
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
            return deferred.resolve(pkg);
        }
        console.log('child process exited with code ' + code);
        deferred.reject(code);
    });

    return deferred.promise;
};

var upDockerCompose = function() {
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
        process.exit(code);
    });

    return deferred.promise;
};

utils.loadPackage()
    .then(createFromTemplate)
    .then(rmDockerCompose)
    .then(upDockerCompose);