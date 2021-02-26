# Logging Schema 1.0

## Regex input events
### Parsons 
```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "regex-input",
  "input-type": "parsons", // the type of input: parsons or free
  "action": "add", // add, move, remove
  "block": "$", // the block added/moved/removed
  "position": [-1, 3], // the index of the block before and after the input(starting from 0). If the index does not exist, it is -1. For an add event, it must be[-1, x], and for a remove event it must be[x, -1].
  "result":["a","b","c","$"], // a list of blocks, as some blocks might have more than one characters
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```

### Free-write

Uses the [delta object](https://quilljs.com/docs/delta/) in Quill.js to represent changes.

```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "regex-input",
  "input-type": "free", // the type of input: parsons or free
  "delta": { // Delta type from Quill.js: describes the change in text
      "ops": [ {retain: 3}, {delete: 1}] // retains the first 3 characters and delete one after. See the link above for details
  },
  "result": "abcd", // the result after input
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```

## Test string input events
### Content changed

Similar to the free write input for regex, uses the delta object(ops) in quill.js.

```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "test-string-input",
  "input-type": "free", // the type of regex input: parsons or free
  "delta": { // Delta type from Quill.js: describes the change in text
      "ops": [ {retain: 3}, {delete: 1}] // retains the first 3 characters and delete one after. See https://quilljs.com/docs/delta/ for details
  },
  "result": "abcd", // the result after input
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```

### reset

```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "test-string-reset",
  "input-type": "free", // the type of regex input: parsons or free
  "result": "abcd", // the result after reset(the initial test string)
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```

## Run match

```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "match",
  "input-type": "free", // the type of regex input: parsons or free
  "trigger": "manual", // manual or auto(always check on input)
  "regex": "regex string",
  "test-string": "test string",
  "flags": ["re.MULTILINE", "re.IGNORECASE"], // flags when running match. is an empty list when no flags specified
  "status": "success", // success or error(error when running python)
  "error-message": "error stack from python", // optional, only exists when python throws error
  "match-result": [ // a list of matches.
        [ // each match is a list of groups
            {
                "group_id": 0, // index of the match group, starting from 0
                "start": 0,  // start position of the group in the test string
                "end": 5, // end position + 1 of the group in the test string.
                "data": "match" // the actual match spanning [start, end)
            },
        ], [...], [...]
  ],
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```



## Options
- Set flags

```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "set-option",
  "option": "regex-flag", // name of the option
  "input-type": "free", // the type of regex input: parsons or free
  "action": "add", // add or remove
  "flag": "re.MULTILINE", // the flag added or removed. can only be done one at a time.
  "flags-result": ["re.MULTILINE", "re.IGNORECASE"], // flags selected after setting flags
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```

- Set always check on input

```json
{
  "student-id": "student-a", // depends on the identification method 
  "problem-id": "test1",
  "event-type": "set-option",
  "option": "always-check", // name of the option
  "input-type": "free", // the type of regex input: parsons or free
  "always-check-result": true, // status of the option after the event
  "timestamp": "yy-MM-dd HH:mm:ss" // local timestamp of client
}
```

