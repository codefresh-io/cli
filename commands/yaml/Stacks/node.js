var stack =
  {
    name : 'nodejs',
    steps : [
      {
          "name" :  "build_step",
          "type": "build",
          "fail_fast": false,
          "dockerfile": "Dockerfile",
          "image-name": "owner/imageName",
          "tag" : "latest"
      },

      {
          "name" :  "test-step",
          "fail_fast": false,
          "image": "node:latest",
          "commands":
          [  "npm install -g better-npm-run" ,
             "npm install -g mocha" ,
             "npm install" ,
             "npm test"
          ]

       } ,
     ]
  };

var get = function() {
    return stack;
};

module.exports.get = get;