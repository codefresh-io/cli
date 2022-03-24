# fail if one of the commands returns non-zero code
set -e
set -o pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
CODEFRESH_PATH="$SCRIPT_DIR/../lib/interface/cli/codefresh"

echo "Using $CODEFRESH_PATH"
function codefresh() {
    $CODEFRESH_PATH $@
}

codefresh version
echo

for executable in $SCRIPT_DIR/scenarios/*.sh
do
  source $executable > "$LOGS_DIR/$executable.log" &
  echo "[$!] Executing: $executable"
done
echo

for job in `jobs -p`
do
    echo "Waiting for $job..."
    wait $job || exit 1
done

echo
echo "All tests executed successfully!"
