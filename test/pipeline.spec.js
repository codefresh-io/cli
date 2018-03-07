//const pipeline = require('../lib/logic')
  debugger;
const { auth }        = require('../lib/logic');
console.log(auth);
const _ = require('lodash');
const pipelines = require('../lib/logic/api/pipeline');
const { JWTContext }  = auth.contexts;
const authManager     = auth.manager;

  let handler,_loginWithToken;

  let it = async (name, f)=>{
    f.call(name, (context)=>{
      console.log(`running by using context: ${context.name}`)
    });
  }
  process.nextTick(()=>{
  it('auth', async (done)=>{
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NTJlOTQyMjM4MjQ4MzFkMDBiMWNhM2UiLCJhY2NvdW50SWQiOiI1NjgwZjEzMDM0Y2RiMzE3N2M4MmFjYjIiLCJpYXQiOjE1MTIyMzA5MDcsImV4cCI6MTUxNDgyMjkwN30.-OUq7kVLVghCjV4tp7swSzCyzPn-GR3ZF0A-aZo1ic0'
    let argv  = {
      name : 'testcontext1',
      url : 'https://g.codefresh.io',
      token
    }

    const a = await handler(argv);
    console.log('after handler');
    console.log(a);

    const workflowId = await pipelines.runPipelineById('599a72291b3376000106331f', {});
    const util  = require('util');
    const http = require('../lib/logic/api/helper');
    let options = {
        url: `/api/builds/${workflowId}`,
        method: 'GET'
    };
    console.log(`workflow : ${util.format(workflowId)}`);
    let buildInfo = await http.sendHttpRequest(options)
     options = {
        url: `/api/progress/${buildInfo.progress_id}`,
        method: 'GET'
    };
    let buildStatus = await http.sendHttpRequest(options)
    console.log(`progress : ${util.format(buildStatus)}`);




  })
});

 handler = async (argv) => {
      const authContext = await _loginWithToken(argv.url, argv.token);

      await authContext.validate();

      if (argv.name) {
          authContext.setName(argv.name);
      }

      let updatedExistingContext = false;
      if (authManager.getContextByName(authContext.getName())) {
          updatedExistingContext = true;
      }

      await authManager.addContext(authContext);
      await authManager.setCurrentContext(authContext);
      await authManager.persistContexts(authContext);

      if (updatedExistingContext) {
          console.log(`Updated context: ${authContext.name}`);
      } else {
          console.log(`Created new context: ${authContext.name}`);
      }

      console.log(`Switched to context: ${authContext.name}`);
      return await authContext;
  };


   _loginWithToken = async (url, token) => {
      try {
          const authContext = JWTContext.createFromToken(token, url);
          return authContext;

      } catch (err) {
          const error = new CFError({
              cause: err,
              message: 'Failed to login with token',
          });
          throw error;
      }
  };
