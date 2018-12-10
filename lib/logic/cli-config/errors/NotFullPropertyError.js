class NotFullPropertyError extends Error {
    constructor(property) {
        super();
        this.property = property;
    }
}

module.exports = NotFullPropertyError;
