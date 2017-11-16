var fs          = require('fs'),
    Q           = require('q'),
    rmrf        = Q.nfbind(require('rimraf')),
    ncp         = require('ncp'),
    ncpFunc     = Q.nfbind(ncp.ncp),
    path        = require('path'),
    filewalker  = require('filewalker'),
    swig        = require('swig'),
    writeFile   = Q.nfbind(fs.writeFile),
    readFile    = Q.nfbind(fs.readFile),
    rename      = Q.nfbind(fs.rename),
    exists      = Q.nfbind(fs.exists),
    mkdir       = Q.nfbind(fs.mkdir);

ncpFunc.limit = 16;

var tar; // todo 'tar' is not defined
function tarFolder(sourceFolderPath, destPath) {
    var deferred = Q.defer();

    var dest = fs.createWriteStream(destPath);

    var pack = tar.pack(sourceFolderPath, {
        map: function(header) {
            return header;
        }
    });

    pack.pipe(dest);

    pack.on('error', function(err){
        deferred.reject(err);
    });

    dest.on('finish', function() {
        deferred.resolve();
    });

    dest.on('error', function(err){
        deferred.reject(err);
    });

    return deferred.promise;
}

function untarFolder(sourceTarPath, destPath) {
    var deferred = Q.defer();

    var untar = fs.createReadStream(sourceTarPath);

    var dest = tar.extract(destPath);

    untar.pipe(dest);

    untar.on('error', function(err){
        deferred.reject(err);
    });

    dest.on('finish', function() {
        deferred.resolve();
    });

    dest.on('error', function(err){
        deferred.reject(err);
    });

    return deferred.promise;
}

function copyFolder(sourceFolderPath , destPath, data) {
    var deferred = Q.defer();
    var promises = [];

    try{
        fs.lstatSync(sourceFolderPath);
    }
    catch(err){
        deferred.reject(err);
    }

    if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath);
    }

    filewalker(sourceFolderPath)
        .on('dir', function(dirPath) {
            var destToFolder = swig.render(path.resolve(destPath, dirPath), {locals: data});

            var processFolderPromise = exists(destToFolder)
                .then(function(isExists) {
                    if (!isExists) {
                        return mkdir(destToFolder);
                    }
                    return;
                })
                .catch(function () {
                    // console.error(err + err.stack);
                });

            promises.push(processFolderPromise);
        })
        .on('file', function(relativePathToFile) {

            var pathToFile = path.resolve(sourceFolderPath, relativePathToFile);
            var destToFile = swig.render(path.resolve(destPath, relativePathToFile), {locals: data});

            var processFilePromise = readFile(pathToFile, 'utf8')
                .then(function (fileString) {
                    //replace {{var}} in fileString according to bindings in data
                    return swig.render(fileString, {locals: data});
                })
                .then(function (replacedString) {
                    return writeFile(destToFile, replacedString, 'utf8');
                })
                .catch(function () {
                    // console.error(err + err.stack);
                });

            promises.push(processFilePromise);

        })
        .on('error', function(err) {
            deferred.reject(err);
        })
        .on('done', function() {
            Q.all(promises).done(
                deferred.resolve.bind(deferred),
                deferred.reject.bind(deferred));
        })
        .walk();

    return deferred.promise;
}

function deleteFolder(folderPath) {
    return rmrf(folderPath);
}


//function renameFolder(folderPath, data) {
//    var deferred = Q.defer();
//    var promises = [];
//
//    try{
//        fs.lstatSync(folderPath);
//    }
//    catch(err){
//        deferred.reject(err);
//    }
//
//    filewalker(folderPath)
//        .on('dir', function(dirPath) {
//            var renderDir = swig.render(dirPath, {locals: data});
//
//            if (dirPath !== renderDir) {
//                var processFolderPromise = rename(path.resolve(folderPath, dirPath), path.resolve(folderPath, renderDir));
//                promises.push(processFolderPromise);
//            }
//        })
//        .on('file', function(relativePathToFile) {
//
//            var pathToFile = path.resolve(folderPath, relativePathToFile);
//
//            var processFilePromise = readFile(pathToFile, 'utf8')
//                .then(function (fileString) {
//                    //replace {{var}} in fileString according to bindings in data
//                    return swig.render(fileString, {locals: data});
//                })
//                .then(function (replacedString) {
//                    return writeFile(pathToFile, replacedString, 'utf8');
//                })
//                .catch(function (err) {
//                    console.error(err + err.stack);
//                });
//
//            promises.push(processFilePromise);
//        })
//        .on('error', function(err) {
//            deferred.reject(err);
//        })
//        .on('done', function() {
//            Q.all(promises).done(
//                deferred.resolve.bind(deferred),
//                deferred.reject.bind(deferred));
//        })
//        .walk();
//
//    return deferred.promise;
//}

/**
 * will replace each occurrence of {someVariable} inside each file inside folderPath to 'some-variable' matching inside data
 * the chars: '-' '_' are not allowed. i.e {some-variable} {some_variable}
 * CAUTION: if there is a missing variable in data, it will be replaced with an empty string
 */
function formatFolder(folderPath, data){
    var deferred = Q.defer();
    var promises = [];

    try{
        fs.lstatSync(folderPath);
    }
    catch(err){
        deferred.reject(err);
    }

    filewalker(folderPath)
        .on('dir', function(dirPath) {
            var renderDir = swig.render(dirPath, {locals: data});

            if (dirPath !== renderDir) {
                var processFolderPromise = rename(
                    path.resolve(folderPath, dirPath),
                    path.resolve(folderPath, renderDir));
                promises.push(processFolderPromise);
            }
        })
        .on('file', function(relativePathToFile) {

            var pathToFile = path.resolve(folderPath, relativePathToFile);

            var processFilePromise = readFile(pathToFile, 'utf8')
                .then(function (fileString) {
                    //replace {{var}} in fileString according to bindings in data
                    return swig.render(fileString, {locals: data});
                })
                .then(function (replacedString) {
                    return writeFile(pathToFile, replacedString, 'utf8');
                })
                .catch(function (err) {
                    console.error(err + err.stack);
                });

            promises.push(processFilePromise);
        })
        .on('error', function(err) {
            deferred.reject(err);
        })
        .on('done', function() {
            Q.all(promises).done(
                deferred.resolve.bind(deferred),
                deferred.reject.bind(deferred));
        })
        .walk();

    return deferred.promise;
}


module.exports.tarFolder = tarFolder;
module.exports.untarFolder = untarFolder;
module.exports.copyFolder = copyFolder;
module.exports.deleteFolder = deleteFolder;
module.exports.formatFolder = formatFolder;



