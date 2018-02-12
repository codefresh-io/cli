+++
title = "Config"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 10
+++

Config context stores a set of keys and values.

### Type
`.spec.type` should be `config`.

### Data
`.spec.data` should be an array of keys and values.

### Examples

#### config with two keys
```yaml
apiVersion: "v1"
kind: "context"
owner: "account"
metadata:
  name: "my-config-context"
spec:
  type: "config"
  data:
    dbUrl: "db-url"
    sysUrl: "sys-url"
```
