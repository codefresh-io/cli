var stack =
    {
        name : 'go',
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
                "image": "golang",
                "commands":
                    [
                        "go test"
                    ]

            } ,
        ]
    };

var get = function () {
    return stack;
};

module.exports.get = get;