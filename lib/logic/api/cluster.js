const _ = require('lodash');
const { sendHttpRequest } = require('./helper');
const Cluster = require('../entities/Cluster');
const rp = require('request-promise');
const fs = require('fs');
const { spawn } = require('child_process');
const { homedir, arch } = require('os');
const request = require('request');
const decompress = require('decompress');
const decompressTargz = require('decompress-targz');
const compareVersions = require('compare-versions');

const _createClusterScript = (info, filePath) => {
    const { name, context } = info;
    fs.chmodSync(filePath, '755');
    const clusterScript = spawn(filePath, ['create', '--c', name, '--token', context.token, '--api-host', `${context.url}/`] );
    clusterScript.stdout.pipe(process.stdout);
    clusterScript.stderr.pipe(process.stderr);
    process.stdin.pipe(clusterScript.stdin);
    clusterScript.on('exit', (code) => {
        process.exit(code);
    });
};

const _extractFieldsForTeamEntity = cluster => ({
    id: cluster._id,
    name: cluster.selector,
    provider: cluster.provider,
    providerAgent: cluster.providerAgent,
});

const getAllClusters = async () => {
    const userOptions = {
        url: '/api/clusters',
        method: 'GET',
    };

    const result = await sendHttpRequest(userOptions);
    const clusters = [];
    let data = {};
    _.forEach(result, (cluster) => {
        data = _extractFieldsForTeamEntity(cluster);
        clusters.push(new Cluster(data));
    });
    return clusters;
};

const createCluster = async (info) => {
    const dirPath = `${homedir()}/.Codefresh/cluster`;
    const filePath = `${homedir()}/.Codefresh/cluster/stevedore`;
    const versionPath = `${homedir()}/.Codefresh/cluster/version.txt`;
    const versionUrl = 'https://raw.githubusercontent.com/codefresh-io/Stevedore/master/VERSION';
    const codefreshPath = `${homedir()}/.Codefresh`;
    let zipPath = `${homedir()}/.Codefresh/cluster/data`;
    let shouldUpdate = true;
    const options = {
        url: versionUrl,
        method: 'GET',
        headers: {
            'User-Agent': 'codefresh',
        },
    };
    const version = await rp(options);
    if (!fs.existsSync(codefreshPath)) {
        fs.mkdirSync(codefreshPath);
        fs.mkdirSync(dirPath);
    } else if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    } else if (fs.existsSync(versionPath)) {
        const currVersion = fs.readFileSync(versionPath, { encoding: 'UTF8' }).trim();
        if (compareVersions(currVersion, version) >= 0) {
            shouldUpdate = false;
        }
    }
    if (shouldUpdate) {
        let osType;
        const { platform } = process;
        if (_.isEqual(platform, 'darwin')) {
            osType = _.isEqual(arch(), 'x32') ? 'Darwin_i386.tar.gz' : 'Darwin_x86_64.tar.gz';
            zipPath = `${zipPath}.tar.gz`;
        } else if (_.isEqual(platform, 'linux')) {
            osType = _.isEqual(arch(), 'x32') ? 'Linux_i386.tar.gz' : 'Linux_x86_64.tar.gz';
            zipPath = `${zipPath}.tar.gz`;
        } else if (_.isEqual(platform, 'ein32')) {
            osType = _.isEqual(arch(), 'x32') ? 'Windows_i386.zip' : 'Windows_x86_64.zip';
            zipPath = `${zipPath}.zip`;
        }
        const assetUrl = `https://github.com/codefresh-io/Stevedore/releases/download/v${version}/stevedore_${version}_${osType}`;
        const req = request(assetUrl);
        req.pipe(fs.createWriteStream(zipPath));
        req.on('end', () => {
            decompress(zipPath, `${homedir()}/.Codefresh/cluster`, {
                plugins: [
                    decompressTargz(),
                ],
            }).then(() => {
                fs.writeFile(versionPath, version, (err) => {
                    if (err) {
                        throw err;
                    }
                });
                _createClusterScript(info, filePath);
            });
        });
    } else {
        _createClusterScript(info, filePath);
    }
};

const deleteCluster = async (clusterName) => {
    const clusters = await getAllClusters();
    const cluster = _.find(clusters, (curr) => {
        return _.isEqual(curr.info.name, clusterName);
    });
    const options = {
        url: `/api/clusters/${cluster.info.provider}/cluster/${cluster.info.id}`,
        method: 'DELETE',
    };

    return sendHttpRequest(options);
};

module.exports = {
    createCluster,
    getAllClusters,
    deleteCluster,
};
