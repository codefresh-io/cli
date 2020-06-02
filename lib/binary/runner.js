const { spawn } = require('child_process');
const { join, resolve } = require('path');
const { homedir } = require('os');

const CODEFRESH_PATH = resolve(homedir(), '.Codefresh');

class Runner {
    constructor(location = CODEFRESH_PATH) {
        this.location = location;
    }

    async run(component, args) {
        const dir = join(this.location, component.local.dir);
        const path = join(dir, component.local.binary);
        const cp = spawn(path, args, {
            stdio: [process.stdin, process.stdout, process.stderr],
        });
        return new Promise((res) => {
            cp.on('exit', (code) => {
                res(code);
            });
        });
    }
}

module.exports = { Runner };
