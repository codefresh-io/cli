var stack =
    {
        name : 'ruby',
        steps : [
            {
                "name" :  "build_step",
                "type": "build",
                "fail_fast": false,
                "dockerfile": "Dockerfile",
                "image_name": "owner/imageName",
                "tag" : "latest"

            },

            {
                "name" :  "test_step",
                "fail_fast": false,
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