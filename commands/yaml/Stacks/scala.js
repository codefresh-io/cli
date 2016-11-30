/**
 * Created by nikolai on 10/13/16.
 */
var stack =
    {
        name : 'scala',
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
                "name" :  "test_step",
                "fail_fast": false,
                "image": "1science/sbt:0.13.8-oracle-jre-8",
                "commands":
                    [
                        "sbt test"
                    ]
            } ,
        ]
    };

var get = function() {
    return stack;
};

module.exports.get = get;