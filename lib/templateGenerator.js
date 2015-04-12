/*jshint -W003 */
var path        =       require('path'),
    folderFunc  =       require('./folderFunctions'),
    util        =       require('util'),
    Q 		    =       require('q'),
    fs          =       require('fs');

/**
 * options is an object with the following fields:
 *  build_folder - overrides the default build folder
 */
var TemplateGenerator =  function (context, options){
    this.context = context;
    this.options = options;
}

TemplateGenerator.prototype.getTemplatePath = function() {
    return path.resolve(__dirname, "../template");
};

TemplateGenerator.prototype.process = function(){

    var context = this.context;

    var tempCopyFolder = this.options.path || path.resolve(process.cwd(), 'temp');
    var templatePath = this.getTemplatePath();

    return folderFunc.copyFolder(templatePath, tempCopyFolder, context);
};

module.exports = TemplateGenerator;