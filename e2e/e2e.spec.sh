# fail if one of the commands returns non-zero code
set -e
set -o pipefail

export SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
source "$SCRIPT_DIR/helpers.sh"

codefresh version
echo

for executable in $SCRIPT_DIR/scenarios/*.sh
do
  source $executable 2>&1 > "$executable.log" &
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
