---
weight: 40
title: Pipelines
---

# Pipelines

## Get All Pipelines

```cli
$ codefresh get pipelines
```

```string
ID                       NAME               REPOOWNER          REPONAME
55fa65a21058fb6778dc5eef codefresh-io       codefresh-io       codefresh-io
55fa65a21058fb6778dc5f19 repo-analyser      verchol            repo-analyser
55fa65a21058fb6778dc5f4f engine             codefresh-io       engine
55fa65a21058fb6778dc5f55 git-clone          codefresh-io       cf-base-images
```

```cli
$ codefresh get pipelines --name engine
```

```string
ID                       NAME               REPOOWNER          REPONAME
55fa65a21058fb6778dc5f4f engine             codefresh-io       engine
```

```cli
$ codefresh get pipelines --repo-name repo-analyser
```

```string
ID                       NAME               REPOOWNER          REPONAME
55fa65a21058fb6778dc5f19 repo-analyser      verchol            repo-analyser
```

```cli
$ codefresh get pipelines --repo-owner codefresh-io
```

```string
ID                       NAME               REPOOWNER          REPONAME
55fa65a21058fb6778dc5eef codefresh-io       codefresh-io       codefresh-io
55fa65a21058fb6778dc5f4f engine             codefresh-io       engine
55fa65a21058fb6778dc5f55 git-clone          codefresh-io       cf-base-images
```

This command will retrieve an array of pipelines according to the passed filters.

### Command

`codefresh get pipelines`<br>

### Aliases

<ul>
    <li>pipeline</li>
    <li>pip</li>
</ul>

### Filter Options

Option | Default | Description
--------- | ----------- | -----------
--repo-owner |  | Filter pipelines by repository owner.
--repo-name |  | Filter pipelines by repository name.
--name |  | Filter pipelines by pipeline name.

### Output Options

Option | Default | Description
--------- | ----------- | -----------
--output |  | Output format [choices: "json", "yaml", "wide", "name"].
--watch | false | If set to true, the output will continue to get updated.
--watch-interval | 3 | Interval time to get updates from the server.
--limit | 25 | Limit amount of returned results.
--page | 1 | Get a specific set of results according to the defined limit option.


## Get a Single Pipeline

```cli
$ codefresh get pipeline 55fa65a21058fb6778dc5eef
```

> The above command returns a structured table like this:

```string
ID                       NAME               REPOOWNER          REPONAME
55fa65a21058fb6778dc5eef codefresh-io       codefresh-io       codefresh-io
```

This command will retrieve a single pipeline.

### Command

`codefresh get pipeline {ID}`

### Positionals arguments

Argument | Description
--------- | -----------
id | Pipeline id.

### Output Options

Option | Default | Description
--------- | ----------- | -----------
--output |  | Output format [choices: "json", "yaml", "wide", "name"].
--watch | false | If set to true, the output will continue to get updated.
--watch-interval | 3 | Interval time to get updates from the server.
