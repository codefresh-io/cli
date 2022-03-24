# fail if one of the commands returns non-zero code
set -e
set -o pipefail

echo "Using ./lib/interface/cli/codefresh"
function codefresh() {
    ./lib/interface/cli/codefresh $@
}

codefresh version
echo

codefresh get agents > /dev/null &
#codefresh get annotation  > /dev/null &
codefresh get boards > /dev/null &
codefresh get clusters > /dev/null &
codefresh get compositions > /dev/null &
codefresh get environments > /dev/null &
codefresh get images > /dev/null &
codefresh get pipelines > /dev/null &
codefresh get projects > /dev/null &
codefresh get repository > /dev/null &
codefresh get runtime-environments > /dev/null &
#codefresh get sections  > /dev/null &
codefresh get system-runtime-environments > /dev/null &
codefresh get step-types > /dev/null &
codefresh get teams > /dev/null &
codefresh get tokens > /dev/null &
codefresh get helm-repo > /dev/null &
codefresh get registry > /dev/null &
codefresh get triggers > /dev/null &
codefresh get trigger-events > /dev/null &
codefresh get trigger-types > /dev/null &
codefresh get builds > /dev/null &
codefresh get contexts > /dev/null &

jobs -l
echo

for job in `jobs -p`
do
    echo "Waiting for $job..."
    wait $job || exit 1
done
