var stack =
    {
        name : 'ruby',
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
                "image": "ruby:onbuild",
                "commands":
                    [
                        "rake test"
                    ]

            } ,
        ]
    };

var get = function() {
    return stack;
};

module.exports.get = get;