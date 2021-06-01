# Access

Q3's access control system integrates with Mongoose for
role-based querying. It also connects to `q3-core-rest` to
automate authorization in the request and response payloads.

Note that the access control's ledger uses a singleton
pattern so that grants initialized at run-time can be
referenced anywhere. It also relies on a static array, so
changes made to permissions will be lost on reboot.

Q3 API automatically loads grants when it detects the
q3-access.json file, so most projects will have little else
to configure.

## Syntax

The JSON object below represents all possible fields.

```json
{
  "fields": ["*"],
  "role": "Developer",
  "coll": "tests",
  "op": "Read",
  "ownership": "Any",
  "documentConditions": [],
  "ownershipAliases": [],
  "ownershipAliasesOnly": false,
  "ownershipAliasesWith": false,
  "ownershipConditions": []
}
```

### Field

The field property determines the attributes within a
document a user can access. When left undefined, everything
is disallowed. This module interprets fields as globs so
that we can define rules and cover datasets. It can support
a single rule, an array of rules and conditional rules. For
examples, please see below.

#### Single rule

The field below will only grant access to the foo and bar
properties. Everything else will be ignored.

```json
{
  "fields": "{foo,bar}"
}
```

#### Array of rules

The field below will not grant access to the foo and bar
properties. Everything else will be included. Arrays are
best for defining exclusions.

```json
{
  "fields": ["!foo", "!bar"]
}
```

#### Conditional rules

The field below will exclude the foo property when the value
of bar is greater than 1. The wildcard property can be used
if the bar field is nested or repeated throughout the
document. An undefined test is assumed to be truthy.

```json
{
  "fields": [
    {
      "glob": "foo",
      "negate": true,
      "wildcard": false,
      "test": ["bar>1"]
    }
  ]
}
```
