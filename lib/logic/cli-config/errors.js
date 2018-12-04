class NoPropertyError extends Error {
    constructor(property) {
        super();
        this.property = property;
    }
}

class MultiplePropertiesError extends Error {
    constructor(properties) {
        super();
        this.properties = properties;
    }
}

class NotFullPropertyError extends Error {
    constructor(property) {
        super();
        this.property = property;
    }
}

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

module.exports = {
    NoPropertyError,
    MultiplePropertiesError,
    NotFullPropertyError,
    SchemaValidationError,
};
