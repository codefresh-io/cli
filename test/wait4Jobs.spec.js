


describe('wait for jobs', ()=>{
  it('run and wait', (done)=>{

    let MultipleJobRunner = require('../lib/logic/api/workflow')
    let runner = new MultipleJobRunner([],{});
    runner.run();
    let p = progress();
    runner.on('progress', p);
    runner.on('end', (data)=>{
      console.log(`all jobs where completed ${JSON.stringify(data)}`);
      done();
    })
  }).timeout(200000);
})

let progress = ()=>{
  const  progress = require('cli-progress');

// create a new progress bar instance and use shades_classic theme
let  bar1 = new progress.Bar({}, progress.Presets.shades_classic);

// start the progress bar with a total value of 200 and start value of 0
bar1.start(120000, 0);

// update the current value in your application..
return ()=>{
  bar1.update(100);
}

}
