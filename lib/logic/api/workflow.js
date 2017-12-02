
const kefir = require('kefir');
const EventEmitter = require('events');
const debug = require('debug')('workflow.js')
//const pipeline = require('../lib/logic')
  debugger;


const _ = require('lodash');
const pipelines = require('./pipeline');
let jobs = new Array(2);
_.fill(jobs, '5a17cd9620ae550001c2ad5d');
const interval = 1000;

  //  const workflowId = await pipelines.runPipelineById('599a72291b3376000106331f', {});
    const util  = require('util');
    const http = require('./helper');


  /*  let buildInfo = await http.sendHttpRequest(options)
     options = {
        url: `/api/progress/${buildInfo.progress_id}`,
        method: 'GET'
    };
    let buildStatus = await http.sendHttpRequest(options)
    console.log(`progress : ${util.format(buildStatus)}`);

*/

let progressList  = [];
let stream = kefir.sequentially(100, jobs).flatMap((job)=>{
  return kefir.fromPromise(pipelines.runPipelineById(job, {}));
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

resultStream = stream.last().flatten().flatMap((progressId)=>{
  let emitter = new Emitter();
  emitter.start(1000, progressId);
  return kefir.fromEvents(emitter, "value")
});
//afe8bfc6db0a3622ebb1224bebc1d54a63328f58cbad7e581e58fb55944e9b24
/*resultStream = stream.last().flatten().flatMap((progressId)=>{
  return  kefir.withInterval(interval||1000, (emitter) => {
  let options = {
      url: `/api/builds/${progressId}`,
      method: 'GET'
  };
  const statuses  = ["success", "terminated", "failed"]
  http.sendHttpRequest(options).then(v=>{
emitter.emit(v)
    //(emitter) ? emitter.emit(v) : _.noop();
    (_.get(v, "finished")) ? emitter.end() : _.noop()
  }, (e)=>{
    emitter.end();
    console.log(`http error:${e}`);
  })
})
}).map(_.partial(_.pick,_ ,["steps","branchName", "revision", "status"] )).log();
let onlyFinalResults = resultStream.filter(_.partial(_.get,_, "finished")).log('finished');
*/
let onlyFinalResults = resultStream.filter(_.partial(_.get,_, "finished")).log('finished');
resultStream.filter((v)=>v.status !== "success")
resultStream.filter((v)=>v.status === "success")
resultStream.onEnd(()=>{
  console.log('running env finsihed');
})
