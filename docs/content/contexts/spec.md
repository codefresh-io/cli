+++
title = "Spec"
description = ""
date = "2017-04-24T18:36:24+02:00"
weight = 0
+++

A Context needs `.apiVersion`, `.kind`, and `.metadata` fields. 

A Context also needs a `.spec` section.

### Owner
A context can be either attached to a user or to an account.<br>
`.owner` can be either `account` or `user`. <br>
The default is `account`. <br>

### Type
`.spec.type` should be one of the following: `secret`, `config`, `yaml`, `secret-yaml`, `helm-repository`.

### Data
`.spec.data` should be an array of keys and values.

### Examples

#### Create a Context of type config with two keys
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

#### Context of type secret with two keys
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

#### Context of type yaml with two keys
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

#### Context of type secret-yaml with two keys
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
