/* eslint-disable */

const kefir = require('kefir');
const EventEmitter = require('events');
const debug = require('debug')('workflow.js');
const util = require('util');
const http = require('./helper');


const _ = require('lodash');
const pipelines = require('./pipeline');

class MultipleJobRunner extends EventEmitter {

    constructor(jobs, options) {
        super();
        _.set(this, 'jobs', jobs);
        let self = this;

    }


    run() {
        let self = this;
        let progressList = [];
        let stream = kefir.sequentially(100, this.jobs)
            .flatMap((job) => {
                return kefir.fromPromise(pipelines.runPipelineById(job.id, { envVars: job.envs }));
            })
            .log()
            .flatMap((workflow) => {
                let options = {
                    url: `/api/builds/${workflow}`,
                    method: 'GET'
                };
                return kefir.fromPromise(http.sendHttpRequest(options));
            })
            .log('workflow->')
            .map((b) => {
                return _.get(b, 'id');
            })
            .scan((prev, current) => {
                prev.push(current);
                return prev;
            }, progressList);

        class Emitter extends EventEmitter {
            start(period, buildId) {
                this.buildId = buildId;
                let intervalId = setInterval(() => {
                    let options = {
                        url: `/api/builds/${buildId}`,
                        method: 'GET'
                    };
                    const statuses = ['success', 'terminated', 'failed'];
                    http.sendHttpRequest(options)
                        .then((v) => {
                            this.emit('value', v);
                            (_.get(v, 'finished')) ? this.stop() : _.noop();
                        });
                }, period);
                this.intervalId = intervalId;
            }

            stop() {
                debug(`end of http request for buildId ${this.buildId}`);
                clearInterval(this.intervalId);
                this.emit('end');
            }
        }

        let resultStream = stream.last()
            .flatten()
            .flatMap((progressId) => {
                let emitter = new Emitter();
                emitter.start(1000, progressId);
                return kefir.fromEvents(emitter, 'value');
            });

//.map(_.partial(_.pick,_ ,["steps","branchName", "revision", "status"] )).log();
        let onlyFinalResults = resultStream.filter(_.partial(_.get, _, 'finished'))
            .take(_.size(this.jobs))
            .log('finished->');
        let results = [];
        onlyFinalResults.scan((prev, current) => {
            prev.push(current);
            return prev;
        }, results)
            .onEnd(() => {
                self.emit('end', results);
            });
        resultStream.onValue((v) => {
            self.emit('progress', v);
        });
        resultStream.filter((v) => v.status !== 'success');
        resultStream.filter((v) => v.status === 'success');
        onlyFinalResults.onEnd(() => {
            console.log('running env finsihed');
//  self.emit('end');
        });
    }
}

module.exports = MultipleJobRunner;

/*const _ = require('lodash'); $ig
const CFError = require('cf-errors');
const { sendHttpRequest } = require('./helper');
const Workflow = require('../entities/Workflow');
const moment = require('moment');


const _extractFieldsForWorkflowEntity = (workflow) => {
    return {
        id: workflow.id,
        created: moment(workflow.created)
            .fromNow(),
        status: workflow.status,
        service_Name: workflow.serviceName,
        repo_Owner: workflow.repoOwner,
        repo_Name: workflow.repoName,
        branch_Name: workflow.branchName,
    };
};


const getWorkflowById = async (id) => {
    const options = {
        url: `/api/builds/${id}`,
        method: 'GET',
    };
    const workflow = await sendHttpRequest(options);
    const data = _extractFieldsForWorkflowEntity(workflow);
    return new Workflow(data);
};

//TODO: need to ask itai about the total - maybe there is a better way to get the total record without to do 2 http request
const getWorkflows = async () => {
    let userOptions = {
        url: '/api/workflow',
        method: 'GET',
    };
    let result = await sendHttpRequest(userOptions);
    const total = result.workflows.total;
    userOptions = {
        url: `/api/workflow/?limit=${total}`,
        method: 'GET',
    };
    result = await sendHttpRequest(userOptions);
    const workflows = [];
    let data = {};
    _.forEach(result.workflows.docs, (workflow) => {
        data = _extractFieldsForWorkflowEntity(workflow);
        workflows.push(new Workflow(data));
    });

    return workflows;
};


module.exports = {
    getWorkflowById,
    getWorkflows,
};*/

