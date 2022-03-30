project=cli-e2e
pipeline="$project/test-run"
pipeline_file="$SCRIPT_DIR/data/test-run.pip.yaml"

existing_pipeline=`exists pipeline $pipeline`
existing_project=`exists project $project`

if [ -z "$existing_project" ]; then
  echo "Project does not exist: $project"
  echo "Creating project: $project"
  codefresh create project $project
else
  echo "Project already exists: $project"
fi

if [ -z "$existing_pipeline" ]; then
  echo "Pipeline does not exist: $pipeline"
  echo "Creating pipeline: $pipeline"
  codefresh create -f $pipeline_file
else
  echo "Pipeline already exists: $pipeline"
fi

codefresh run $pipeline
codefresh delete pipeline $pipeline
codefresh delete project $project
