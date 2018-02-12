+++
title = "Spec"
+++

A Context needs `.apiVersion`, `.kind`, and `.metadata` fields. 

A Context also needs a `.spec` section.

### Owner
A context can be either attached to a user or to an account.<br>
`.owner` can be either `account` or `user`. <br>
The default is `account`. <br>

### Type
`.spec.type` should be one of the following:  <br>
<ul>
    <li>[config](/contexts/spec/config) </li> 
    <li>[secret](/contexts/spec/secret) </li> 
    <li>[yaml](/contexts/spec/yaml) </li> 
    <li>[secret-yaml](/contexts/spec/secret-yaml) </li> 
    <li>[helm-repository](/contexts/spec/helm-repository) </li> 
</ul>

### Data
`.spec.data` should be different according to the type of the context



