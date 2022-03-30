project='pipeline-crud'
pipeline="$project/crud"
pipeline_file="$SCRIPT_DIR/data/crud.pip.yaml"

existing_project=`exists project $project`
existing_pipeline=`exists pipeline $pipeline`

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
  codefresh delete pipeline $pipeline
  codefresh create -f $pipeline_file
fi

codefresh get pipelines
codefresh get pipeline $pipeline

codefresh delete pipeline $pipeline
codefresh delete project $project

