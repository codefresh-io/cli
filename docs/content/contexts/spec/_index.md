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
    <li>[config](config) </li> 
    <li>[secret](secret) </li> 
    <li>[yaml](yaml) </li> 
    <li>[secret-yaml](secret-yaml) </li> 
    <li>[helm-repository](helm-repository) </li> 
</ul>

### Data
`.spec.data` should be different according to the type of the context



