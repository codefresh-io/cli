CODEFRESH_PATH="$SCRIPT_DIR/../lib/interface/cli/codefresh"

echo "Using $CODEFRESH_PATH"
function codefresh() {
    $CODEFRESH_PATH $@
}

function exists() {
    codefresh get $1 | grep $2 || echo ''
}
