class SchemaValidationError extends Error {
    constructor(errors) {
        super();
        this.errors = errors;
    }

    printErrors() {
        this.errors.forEach((e) => {
            console.log(`Validation error: property "${e.dataPath.replace('.', '')}" ${e.message}`);
        });
    }
}

module.exports = SchemaValidationError;
