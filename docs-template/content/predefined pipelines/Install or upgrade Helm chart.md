+++
title = "Install or upgrade Helm chart"
+++

### Command
`codefresh install-chart`

Install or upgrade Helm chart
### Options

Option | Default | Description
--------- | ----------- | -----------
--cluster |  | Install on cluster
--namespace | default | Install on namespace
--tiller-namespace | kube-system | Where tiller has been installed
--repository |  | Helm repository
--name |  | Name of the chart in the repository
--version |  | Version of the chart in the repository
--context |  | Contexts (yaml || secret-yaml) to be passed to the install
--release-name |  | The name to set to the release
