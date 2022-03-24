set -e
set -o pipefail

echo "Using ./lib/interface/cli/codefresh"
#alias codefresh='./lib/interface/cli/codefresh'
function codefresh() {
    ./lib/interface/cli/codefresh $@
}

codefresh version
echo

echo "codefresh get agents"
codefresh get agents > /dev/null
echo

echo "Skip:codefresh get annotation"
#codefresh get annotation
echo

echo "codefresh get boards"
codefresh get boards > /dev/null
echo

echo "codefresh get clusters"
codefresh get clusters > /dev/null
echo

echo "codefresh get compositions"
codefresh get compositions > /dev/null
echo

echo "codefresh get environments"
codefresh get environments > /dev/null
echo

echo "codefresh get images"
codefresh get images > /dev/null
echo

echo "codefresh get pipelines"
codefresh get pipelines > /dev/null
echo

echo "codefresh get projects"
codefresh get projects > /dev/null
echo

echo "codefresh get repository"
codefresh get repository > /dev/null
echo

echo "codefresh get runtime-environments"
codefresh get runtime-environments > /dev/null
echo

echo "Skip: codefresh get sections"
#codefresh get sections
echo

echo "codefresh get system-runtime-environments"
codefresh get system-runtime-environments > /dev/null
echo

echo "codefresh get step-types"
codefresh get step-types > /dev/null
echo

echo "codefresh get teams"
codefresh get teams > /dev/null
echo

echo "codefresh get tokens"
codefresh get tokens > /dev/null
echo

echo "codefresh get helm-repo"
codefresh get helm-repo > /dev/null
echo

echo "codefresh get registry"
codefresh get registry > /dev/null
echo

echo "codefresh get triggers"
codefresh get triggers > /dev/null
echo

echo "codefresh get trigger-events"
codefresh get trigger-events > /dev/null
echo

echo "codefresh get trigger-types"
codefresh get trigger-types > /dev/null
echo

echo "codefresh get builds"
codefresh get builds > /dev/null
echo

echo "codefresh get contexts"
codefresh get contexts > /dev/null
echo
