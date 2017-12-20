const TopCommand = require('./topCommand');
const run = new TopCommand({
  command : "run",
  desription : "top command run",
})
const auth = new TopCommand({
  command : "auth",
  desription : "top command run",

})
const annotate = new TopCommand({
  command : "annotate",
  desription : "top command annotate"

})
const create = new TopCommand({
  command : "create",
  desription : "top command create"

})
const delete1 = new TopCommand({
  command : "delete",
  desription : "top command delete"
})
const describe = new TopCommand({
  command : "run",
  desription : "top command describe",
});

 const get = new TopCommand({
    command : "get",
    desription : "top command run"
  })

  const replace = new TopCommand({
     command : "run",
     desription : "top command run",

   })

module.exports = {run, auth, annotate, replace, describe, get}
