class NoPropertyError extends Error {
    constructor(property) {
        super();
        this.property = property;
    }
}

module.exports = NoPropertyError;
