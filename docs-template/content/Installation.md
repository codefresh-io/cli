---
weight: 10
title: API Reference
---

# Installation
Codefresh CLI is developed and built with node.js.
In case you have node.js installed on your machine you can use npm or yarn to install it.<br>
If you don't have node.js installed you can install the CLI by downloading a binary.

## NPM
Codefresh's cli is available for installation through NPM registry.

Install:
`npm install -g codefresh`

Install a specific version:
`npm install -g codefresh@{VERSION}`

Update to latest version:
`npm install -g codefresh`

Update to a specific version:
`npm install -g codefresh@${VERSION}`

## YARN
Install:
`yarn global add codefresh`

Install a specific version:
`yarn global add codefresh@{VERSION}`

Update to latest version:
`yarn global upgrade codefresh`

Update to a specific version:
`yarn global upgrade codefresh@{VERSION}`

## Binaries
Navigate to <a href="https://github.com/codefresh-io/cli/releases" target="_blank">Official Releases</a>
and download the binary that matches your operating system.<br>
We currently support the following OS: <br>
<ul>
    <li><a href="https://github.com/codefresh-io/cli/releases/download/v0.6.6/codefresh-v0.6.6-linux-x64.tar.gz" target="_blank">Linux-x64</a></li>
    <li><a href="https://github.com/codefresh-io/cli/releases/download/v0.6.6/codefresh-v0.6.6-macos-x64.tar.gz" target="_blank">Macos-x64</a></li>
    <li><a href="https://github.com/codefresh-io/cli/releases/download/v0.6.6/codefresh-v0.6.6-win-x64.tar.gz" target="_blank">Windows-x64</a></li>
</ul> 

After downloading the binary, untar or unzip it and your are good to go.<br>
You can also add the binary to your system PATH environment variable so you can use it easily.

If your operating system is missing please feel free to open us an issue in our <a href="https://github.com/codefresh-io/cli/issues" target="_blank">Github repository</a>.

## Docker image
You can run the CLI using our official docker image which is published to <a href="https://hub.docker.com/r/codefresh/cli/" target="_blank">Dockerhub</a><br>

Pull the latest version: 
`docker pull codefresh/cli`

Pull a specific version:
`docker pull codefresh/cli:${VERSION}`

