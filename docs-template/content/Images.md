---
title: Images
---

# Images

## Annotate an image

### Command
`codefresh annotate image <id>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Docker image full name or id
### Options

Option | Default | Description
--------- | ----------- | -----------
--label |  | annotations to add to the image
## describe image

### Command
`codefresh describe image <id>`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | image id
## Get images

### Command
`codefresh get images [id]`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | image id
### Options

Option | Default | Description
--------- | ----------- | -----------
--limit | 25 | Limit amount of returned results
--all |  | Return images from all possible registries (by default only r.cfcr.io images will be returned)
--label |  | Filter by a list of annotated labels
--sha |  | Filter by specific commit sha
--image-name |  | Filter by specific image name
--branch |  | Filter by specific branch
--page | 1 | Paginated page
## Add an image tag

### Command
`codefresh tag <id> [tags..]`

undefined
### Positionals

Option | Default | Description
--------- | ----------- | -----------
id |  | Docker image id
names |  | Tag names
