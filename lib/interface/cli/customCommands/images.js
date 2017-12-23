const verbs = require('../topCommands/verbs');
verbs.annotate.addBuilder((yargs)=>{
  yargs.command({command : "images",
   description :"annotate images with custome tags"});
})
