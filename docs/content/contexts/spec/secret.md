+++
title = "Secret"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 20
+++

Secret context stores a set of keys and values encrypted.

### Type
`.spec.type` should be `secret`.

### Data
`.spec.data` should be an array of keys and values.

### Examples

#### secret with two keys
```yaml
apiVersion: "v1"
kind: "context"
owner: "account"
metadata:
  name: "my-secret-context"
spec:
  type: "secret"
  data:
    dbPassword: "secret-db-password"
    adminPassword: "secret-admin-password"
```
