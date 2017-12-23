 const verbs = require('../topCommands/verbs');
 verbs.annotate.addBuilder((yargs)=>{
   yargs.command({command : "pipeline",
    description :"annotate pipeline"});
 })
