+++
title = "Get a single image"
+++

### Command
`codefresh images [id]`

Get a specific or an array of images
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
