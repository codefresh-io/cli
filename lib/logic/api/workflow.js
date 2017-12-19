
const kefir = require('kefir');
const EventEmitter = require('events');
const debug = require('debug')('workflow.js')
const util  = require('util');
const http = require('./helper');


const _ = require('lodash');
const pipelines = require('./pipeline');

class MultipleJobRunner extends EventEmitter{

 constructor(jobs, options){
   super();
   _.set(this, "jobs" , jobs);
   let self = this;

 }


run (){
  let self = this;
  let progressList  = [];
  let stream = kefir.sequentially(100, this.jobs).flatMap((job)=>{
    return kefir.fromPromise(pipelines.runPipelineById(job.id, {envVars:job.envs}));
  }).log().flatMap((workflow)=>{
    let options = {
        url: `/api/builds/${workflow}`,
        method: 'GET'
    };
    return kefir.fromPromise(http.sendHttpRequest(options))
  }).log('workflow->').map((b)=>{
    return _.get(b, "id")
  }).scan((prev, current)=>{
    prev.push(current);
    return prev
  }, progressList)

 class Emitter extends EventEmitter{
  start(period, buildId){
    this.buildId = buildId;
    let intervalId = setInterval(()=>{
    let options = {
        url: `/api/builds/${buildId}`,
        method: 'GET'
    };
    const statuses  = ["success", "terminated", "failed"]
    http.sendHttpRequest(options).then((v)=>{
      this.emit('value', v);
      (_.get(v, "finished")) ? this.stop() : _.noop()
    });
  }, period);
  this.intervalId = intervalId;
}

stop(){
  debug(`end of http request for buildId ${this.buildId}`);
  clearInterval(this.intervalId);
  this.emit('end');
}
}

let resultStream = stream.last().flatten().flatMap((progressId)=>{
  let emitter = new Emitter();
  emitter.start(1000, progressId);
  return kefir.fromEvents(emitter, "value")
})

//.map(_.partial(_.pick,_ ,["steps","branchName", "revision", "status"] )).log();
let onlyFinalResults = resultStream.filter(_.partial(_.get,_, "finished")).take(_.size(this.jobs)).log('finished->');
let results = [];
onlyFinalResults.scan((prev , current)=>{
  prev.push(current);
  return prev;
}, results).onEnd(()=>{
    self.emit('end' ,results);
})
resultStream.onValue((v)=>{
  self.emit('progress', v);
})
resultStream.filter((v)=>v.status !== "success")
resultStream.filter((v)=>v.status === "success")
onlyFinalResults.onEnd(()=>{
  console.log('running env finsihed');
//  self.emit('end');
})
}
}
module.exports = MultipleJobRunner;
