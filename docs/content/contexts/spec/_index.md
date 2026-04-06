+++
title = "Spec"
+++

A Context needs `.apiVersion`, `.kind`, and `.metadata` fields. 

A Context also needs a `.spec` section.

### Owner
A context can be either attached to a user or to an account.

`.owner` can be either `account` or `user`.

The default is `account`.

### Type
`.spec.type` should be one of the following:

- [config](config)
- [secret](secret)
- [yaml](yaml)
- [secret-yaml](secret-yaml)
- [helm-repository](helm-repository)

### Data
`.spec.data` should be different according to the type of the context



