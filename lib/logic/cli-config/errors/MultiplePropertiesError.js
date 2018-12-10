class MultiplePropertiesError extends Error {
    constructor(properties) {
        super();
        this.properties = properties;
    }
}

module.exports = MultiplePropertiesError;
