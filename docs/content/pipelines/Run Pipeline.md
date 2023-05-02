{{HEADER}}

{{DESCRIPTION}}

{{COMMANDS}} 

{{ARGUMENTS}}

{{OPTIONS}}

### variable-file (var-file)
It is possible to pass build variables using a file. (supported format: json and yaml) <br>
The variables file structure should be an array. <br>
The pipeline will be triggered multiple times according to the array length.

#### Variable yaml file with 2 sets of variables
```yaml
- key: value
  key2: key1
- key: value
  key2: key2
```

#### Variable json file with 2 sets of variables
```json
[
  {
    "key": "value",
    "key2": "key1"
  },
  {
    "key": "value",
    "key2": "key2"
  }
]
```

{{EXAMPLES}}
