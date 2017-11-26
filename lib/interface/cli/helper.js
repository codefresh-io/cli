const defaults = require('./defaults');

const printError = (error) => {
    if ((process.env.DEBUG || '').includes(defaults.DEBUG_PATTERN)) {
        console.error(error.stack);
    } else {
        console.error(error.toString());
    }
};

const wrapHandler = (handler) => {
    return async (argv) => {
        try {
            await handler(argv);
        } catch (err) {
            printError(err);
            process.exit(1);
        }
    };
};


//
// old helper functions
//
/*const IsJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

const toFile = (pathToFile, content) => {
    var p = new Promise((resolve, reject) => {
        fs.writeFile(pathToFile, JSON.stringify(content), (err) => {
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

const generateRows = (type, array) => {
    var rows = [];
    switch (type) {
        case "build":
            var workflows = array.workflows;
            if (workflows) {
                _.each(workflows.docs, function (item) {
                    rows.push(new Workflow.Workflow(item).toJson());
                });
            }

            var builds = array.builds;
            if (builds) {
                _.each(builds.docs, function (item) {
                    rows.push(new Build.Build(item).toJson());
                });
            }
            break;
        case "image":
            if (Array.isArray(array)) {
                _.each(array, function (item) {
                    rows.push(new Image.Image(item).toJson());
                });
            } else {
                rows.push(new Image.Image(array).toJson());
            }
            break;
        case "composition":
            if (Array.isArray(array)) {
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

const toTable = (type, array, header) => {
    var rows   = generateRows(type, array);
    var footer = [];

    var table = Table(header, rows, footer, {
        borderStyle: 1,
        borderColor: "blue",
        paddingBottom: 0,
        headerAlign: "center",
        align: "center",
        color: "white"
    });

    var output = table.render();
    console.log(output);
};

const toList = (type, array) => {
    _.forEach(array, (row) => {
        const image = new Image.Image(row);
        console.log(image.toString());
    });
};*/
//
// old helper functions
//

module.exports = {
    printError,
    wrapHandler,
};