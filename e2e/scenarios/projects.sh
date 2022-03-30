project=cli-e2e-project-crud

existing_project=`exists project $project`

if [ -z "$existing_project" ]; then
  echo "Project does not exist: $project"
  echo "Creating project: $project"
  codefresh create project $project
else
  echo "Project already exists: $project"
  codefresh delete project $project
  codefresh create project $project
fi

codefresh get projects
codefresh get project $project
codefresh delete project $project
