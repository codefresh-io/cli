const Promise = require('bluebird');
const _ = require('lodash');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const decompressUnzip = require('decompress-unzip');
const rp = require('request-promise');
const request = require('request');
const compareVersions = require('compare-versions');
const {
    resolve, join,
} = require('path');
const {
    homedir, arch,
} = require('os');
const {
    existsSync, mkdirSync, readFileSync, createWriteStream, writeFile,
} = require('fs');
const { to } = require('./../logic/cli-config/errors/awaitTo');

const CODEFRESH_PATH = resolve(homedir(), '.Codefresh');

function _ensureDirectory(location) {
    if (existsSync(location)) {
        return Promise.resolve();
    }
    mkdirSync(location);
    return Promise.resolve();
}

async function _getRemoteVersion({
    name, branch, path, file,
}) {
    const final = branch ? `${name}/${branch}/${path}` : `${name}/${path}`;
    const url = `https://raw.githubusercontent.com/codefresh-io/${final}/${file}`;
    const req = await rp({
        url,
        method: 'GET',
        headers: { 'User-Agent': 'codefresh' },
    });
    return req;
}

function _buildDownloadURL({ name, version, binary }) {
    return `https://github.com/codefresh-io/${name}/releases/download/${version}/${binary}`;
}

function _getLocalVersion(location) {
    if (!existsSync(location)) {
        return '0';
    }
    const content = readFileSync(location, { encoding: 'UTF8' }).trim();
    if (content === '') {
        return '0';
    }
    return content;
}

function _buildLocalOSProperties() {
    let osType;
    let osSuffix;
    const { platform } = process;
    if (_.isEqual(platform, 'darwin')) {
        osType = _.isEqual(arch(), 'x32') ? 'Darwin_i386.tar.gz' : 'Darwin_x86_64.tar.gz';
        osSuffix = 'tar.gz';
    } else if (_.isEqual(platform, 'linux')) {
        osType = _.isEqual(arch(), 'x32') ? 'Linux_i386.tar.gz' : 'Linux_x86_64.tar.gz';
        osSuffix = 'tar.gz';
    } else if (_.isEqual(platform, 'win32')) {
        osType = _.isEqual(arch(), 'x32') ? 'Windows_i386.zip' : 'Windows_x86_64.zip';
        osSuffix = 'zip';
    }

    return {
        osType,
        osSuffix,
    };
}

async function _writeFiles({
    zipPath, location, version, versionPath,
}) {
    await to(decompress(zipPath, location, {
        plugins: [
            decompressTargz(),
            decompressUnzip(),
        ],
    }));
    return Promise.fromCallback(cb => writeFile(versionPath, version, cb));
}

class Downloader {
    constructor(options = {}) {
        this.location = options.location || CODEFRESH_PATH;
        this.logger = options.logger || console;
        this.progress = options.progress;
    }

    async download(component) {
        const { location, logger } = this;
        _ensureDirectory(location);
        const dir = join(location, component.local.dir);
        _ensureDirectory(dir);
        const compressedBinaryLocation = join(dir, 'data');

        const { osType, osSuffix } = _buildLocalOSProperties();

        let localVersion = _getLocalVersion(join(dir, component.local.versionFile));
        const {
            repo: name, branch, versionPath: path, versionFile: file,
        } = component.remote;
        let remoteVersion = await _getRemoteVersion({
            name, branch, path, file,
        });
        remoteVersion = remoteVersion.trim();
        localVersion = localVersion.trim();

        if (compareVersions(localVersion, remoteVersion) >= 0) {
            // logger.debug(`Download is not required latest-version=${remoteVersion} local-version=${localVersion}`);
            return Promise.resolve();
        }
        logger.debug(`${component.name} component upgrade is required, downloading.`);


        const binary = `${name}_${remoteVersion}_${osType}`;
        const version = component.version.prefix ? `${component.version.prefix}${remoteVersion}` : remoteVersion;
        const url = _buildDownloadURL({ name, version, binary });
        const resp = await request(url);

        const zipLocation = `${compressedBinaryLocation}.${osSuffix}`;
        resp.pipe(createWriteStream(zipLocation));

        if (this.progress) {
            let size = 0;
            resp.on('response', (res) => {
                size = parseInt(res.headers['content-length'], 10);
                this.progress.start(size, 0);
            });

            resp.on('data', (chunk) => {
                size += chunk.length;
                this.progress.update(this.progress.value + chunk.length);
                if (this.progress.value + chunk.length >= size) {
                    logger.log('\n');
                }
            });
        }


        return new Promise((resolveFn, rejectFn) => {
            resp.on('end', async () => {
                const [err] = await to(_writeFiles({
                    zipPath: zipLocation, location: dir, version: remoteVersion, versionPath: resolve(dir, component.local.versionFile),
                }));
                if (err) {
                    rejectFn(err);
                    return;
                }
                resolveFn();
            });
            resp.on('error', (err) => {
                rejectFn(err);
            });
        });
    }
}

module.exports = {
    CommonProgressFormat: 'downloading [{bar}] {percentage}% | {value}/{total}',
    Downloader,
    CODEFRESH_PATH,
};
