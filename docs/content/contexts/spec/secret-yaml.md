+++
title = "Secret Yaml"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 40
+++

Secret-Yaml context stores an yaml file encrypted.

### Type
`.spec.type` should be `secret-yaml`.

### Data
`.spec.data` should be an array of keys and values.

### Examples

#### secret-yaml with two keys
```yaml
apiVersion: "v1"
kind: "context"
owner: "account"
metadata:
  name: "my-secret-yaml-context"
spec:
  type: "secret-yaml"
  data:
    serviceType: "LoadBalancer"
    image: "mongo"
    type: 
      - "encrypted"
```
