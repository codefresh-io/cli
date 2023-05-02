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
- VARIABLE_A: value_a_for_the_first_build
  VARIABLE_B: value_b_for_the_first_build
- VARIABLE_A: value_a_for_the_first_build
  VARIABLE_B: value_b_for_the_first_build
```

#### Variable json file with 2 sets of variables
```json
[
  {
    "VARIABLE_A": "value_a_for_the_first_build",
    "VARIABLE_B": "value_b_for_the_first_build"
  },
  {
    "VARIABLE_A": "value_a_for_the_first_build",
    "VARIABLE_B": "value_b_for_the_first_build"
  }
]
```
### Use encrypted variables in Codefresh build runs; supported from CLI version: 0.83.1
#### Variable yaml file with single variable set with encrypted variables
```yaml
- key:
    val: value
    encrypted: true
  key2: val2

```

#### Variable json file single variable set with encrypted variables
```json
[
  {
    "key": {
      "val": "value",
      "encrypted": true
    },
    "key2": "key1"
  }
]
```

{{EXAMPLES}}
