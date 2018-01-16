+++
title = "Install or upgrade a Helm chart"
+++

### Command
`codefresh install-chart`

Install or upgrade a Helm chart
            Repository flag can be either absolute url or saved repository in Codefresh
### Options

Option | Default | Description
--------- | ----------- | -----------
--cluster |  | Install on cluster
--namespace | default | Install on namespace
--tiller-namespace | kube-system | Where tiller has been installed
--repository |  | Helm repository (absolute url or name of context with type help-repository)
--name |  | Name of the chart in the repository
--version |  | Version of the chart in the repository
--context |  | Contexts (yaml || secret-yaml) to be passed to the install
--detach |  | Run pipeline and print build ID
--release-name |  | The name to set to the release
