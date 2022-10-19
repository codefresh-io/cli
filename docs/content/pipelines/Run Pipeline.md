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
- variable1: value1
  variable2: value2
- variable3: value3
  variable4: value4
```

#### Variable json file with 2 sets of variables
```json
[
  {
    "variable1": "value1",
    "variable2": "value2"
  },
  {
    "variable3": "value3",
    "variable4": "value4"
  }
]
```

{{EXAMPLES}}
