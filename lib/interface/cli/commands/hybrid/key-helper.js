const forge = require('node-forge');
const rp = require('request-promise');
const AdmZip = require('adm-zip');

const sdk = require('../../../../logic/sdk');
// eslint-disable-next-line prefer-destructuring
const pki = forge.pki;
// eslint-disable-next-line prefer-destructuring
const rsa = pki.rsa;

const defaultCertCN = 'docker.codefresh.io';

function generateKeys() {
    return new Promise((resolve, reject) => {
        function keyGenerated(err, { publicKey, privateKey }) {
            if (err) {
                reject(err);
                return;
            }

            const csr = pki.createCertificationRequest();
            csr.publicKey = publicKey;
            csr.setSubject([{
                name: 'commonName',
                value: defaultCertCN,
            }]);
            csr.sign(privateKey);

            resolve({
                key: pki.privateKeyToPem(privateKey),
                csr: pki.certificationRequestToPem(csr),
            });
        }

        rsa.generateKeyPair({
            bits: 2048,
        }, keyGenerated);
    });
}

function extractZipCerts(zip) {
    const data = {};
    const admZip = new AdmZip(zip);
    admZip.forEach(e => {
        if (e.entryName === 'cf-ca.pem') {
            data.ca = admZip.readAsText(e);
        }
        if (e.entryName === 'cf-server-cert.pem') {
            data.serverCert = admZip.readAsText(e);
        }
    });
    return data;
}

async function produceVenonaKeys(namespace) {
    const keys = await generateKeys();
    const body = JSON.stringify({
        reqSubjectAltName: `IP:127.0.0.1,DNS:dind,DNS:*.dind.${namespace},DNS:*.dind.${namespace}.svc,DNS:*.cf-cd.com,DNS:*.codefresh.io`,
        csr: keys.csr,
    });

    const zip = await rp.post({
        uri: `${sdk.config.context.url}/api/custom_clusters/signServerCerts`,
        body,
        encoding: null,
        headers: {
            'Content-type': 'application/json',
            Authorization: sdk.config.context.token,
        },
    });

    const allKeys = {
        ...keys,
        ...extractZipCerts(zip),
    };

    return allKeys;
}

module.exports = {
    produceVenonaKeys,
};
