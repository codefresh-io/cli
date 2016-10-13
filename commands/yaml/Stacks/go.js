var stack =
    {
        name : 'go',
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
                "image": "go:onbuild",
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