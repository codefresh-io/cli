var stack =
  {
    name : 'nodejs',
    steps : [
      {
          "name" :  "build-step",
          "type": "build",
          "fail-fast": false,
          "dockerfile": "Dockerfile",
          "image-name": "owner/imageName",
          "tag" : "latest"
      },

      {
          "name" :  "test-step",
          "fail-fast": false,
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