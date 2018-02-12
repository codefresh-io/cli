+++
title = "Yaml"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 30
+++

Yaml context stores an yaml file.

### Type
`.spec.type` should be `yaml`.

### Data
`.spec.data` should be an array of keys and values.

### Examples

#### yaml with two keys
```yaml
apiVersion: "v1"
kind: "context"
owner: "account"
metadata:
  name: "my-yaml-context"
spec:
  type: "yaml"
  data:
    serviceType: "LoadBalancer"
    image: "mongo"
```
