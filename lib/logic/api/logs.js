const debug = require('debug')('codefresh:api:logs');
const Promise = require('bluebird');
const _ = require('lodash');
const CFError = require('cf-errors'); // eslint-disable-line
const { sendHttpRequest } = require('./helper');
const workflows = require('./workflow');
const Firebase = require('firebase');
const rp = require('request-promise');

const getFirebaseToken = async () => {
    const options = {
        url: '/api/user/firebaseAuth',
        method: 'GET',
    };

    const firebaseAuth = await sendHttpRequest(options);
    return firebaseAuth;
};

const connectToFirebase = async (firebaseAuth) => {
    const promise = new Promise((resolve, reject) => {
        const jobIdRef = new Firebase(firebaseAuth.url);
        jobIdRef.authWithCustomToken(firebaseAuth.accessToken, (err) => {
            if (err) {
                reject(new CFError({
                    cause: err,
                    message: 'Failed to login to Firebase',
                }));
            } else {
                debug('Firebase login succeeded');
                resolve();
            }
        });
    });
    return promise;
};

const printLogsFromJson = (steps) => {
    _.forEach(steps, (step) => {
        const prefixSuffix = Array(step.name.length)
            .join('=');
        console.log(`${prefixSuffix}\nStep: ${step.name}\n${prefixSuffix}`);
        _.forEach(step.logs, (log) => {
            console.log(log);
        });
    });
};

const printCurrentFirebaseLogs = async (firebaseAuth, progressJobId) => {
    const promise = new Promise((resolve, reject) => {
        const jobIdRef = new Firebase(`${firebaseAuth.url}/build-logs/${progressJobId}`);
        jobIdRef.once('value', (snapshot) => {
            const { steps } = snapshot.val();
            printLogsFromJson(steps);

            resolve();
        }, (err) => {
            reject(new CFError({
                cause: err,
                message: 'Failed to get logs from firebase',
            }));
        });
    });
    return promise;
};

// TODO implement
const printFollowFirebaseLogs = async (firebaseAuth, progressJobId) => { // eslint-disable-line
};

const getProgressJob = async (workflowId) => {
    const workflow = await workflows.getWorkflowById(workflowId);
    const progressJobId = workflow.info.progress;

    const options = {
        url: `/api/progress/${progressJobId}`,
        method: 'GET',
    };

    const progressJob = await sendHttpRequest(options);
    return progressJob;
};

const showWorkflowLogsFromFirebase = async (progressJobId, follow) => {
    const firebaseAuth = await getFirebaseToken();
    await connectToFirebase(firebaseAuth);
    if (follow) { // eslint-disable-line
        // TODO implement
    } else {
        await printCurrentFirebaseLogs(firebaseAuth, progressJobId);
    }
};

// when bringing logs from gcs, there is no meaning for workflow since the workflow has finished
const showWorkflowLogsFromGCS = async (progressJob) => {
    const options = {
        url: progressJob.location.url,
        method: 'GET',
        json: true,
    };


    const { steps } = await rp(options);
    printLogsFromJson(steps);
};

const showWorkflowLogs = async (workflowId, follow) => {
    const progressJob = await getProgressJob(workflowId);
    if (progressJob.location.type === 'firebase') {
        await showWorkflowLogsFromFirebase(progressJob._id, follow);
    } else {
        await showWorkflowLogsFromGCS(progressJob);
    }
};


module.exports = {
    showWorkflowLogs,
};
