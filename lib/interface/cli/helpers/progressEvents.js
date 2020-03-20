const EventEmitter = require('events');

class ProgressEvents {
    constructor() {
        this.emitter = new EventEmitter();
    }
    onStart(handler) {
        this.emitter.addListener('start', (args) => {
            handler(args);
        });
    }
    onProgress(handler) {
        this.emitter.addListener('progress', (args) => {
            handler(args);
        });
    }
    reportStart(args) {
        this.emitter.emit('start', args);
    }
    reportProgress(args) {
        this.emitter.emit('progress', args);
    }
}

module.exports = ProgressEvents;
