class NoPropertyError extends Error{
    constructor(property) {
        super();
        this.property = property;
    }
}

class MultiplePropertiesError extends Error{
    constructor(properties) {
        super();
        this.properties = properties;
    }
}

class NotFullPropertyError extends Error{
    constructor(property) {
        super();
        this.property = property;
    }
}

module.exports = {
    NoPropertyError,
    MultiplePropertiesError,
    NotFullPropertyError,
};
