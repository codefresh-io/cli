class PipelineValidationError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }

    toString() {
        return this.message;
    }
}

module.exports = PipelineValidationError;
