# Responder

Q3 responder handles two responsibilities: (1) assigning
HTTP status codes to unhandled exceptions and (2) throwing
custom errors in the stack. Within client projects, the
first is irrelevant as Q3 registers the functionality via
global express middleware. However, the second is very
common when dealing with custom validation logic.

## API

### `exception`

The `exception` export offers a chainable API for building
general and field-level errors. When constructing, the first
parameter will correspond to an HTTP status code (see table
below).

| Error              | Code  |
| ------------------ | ----- |
| `BadRequest`       | `400` |
| `Authentication`   | `401` |
| `Authorization`    | `403` |
| `ResourceNotFound` | `404` |
| `Conflict`         | `409` |
| `Gone`             | `410` |
| `Preprocessing`    | `412` |
| `Validation`       | `422` |
| `InternalServer`   | `500` |

Afterwards, you can chain the following methods. You can
invoke `msg` and `field` in any order but `boomerang`, `log`
and `throw` should end your chain.

| Method      | Param                | Description                                                                                                                                                 |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `msg`       | `String`             | The language key for a message to decorate the HTTP response                                                                                                |
| `field`     | `String` or `Object` | The field-level error to report. If a string, it will duplicate the `msg` output. If an object, you can provide custom messages and map to multiple fields. |
| `throw`     |                      | A custom error will throw in your stack                                                                                                                     |
| `boomerang` |                      | A custom error will return                                                                                                                                  |
| `log`       |                      | A custom error will log to console                                                                                                                          |

#### Example

```javascript
const { exception } = require('q3-core-responder');

function doSomething(args = {}) {
  if (args.bad)
    exception('Conflict')
      .msg('custom18nMessageKey')
      .field('name')
      .throw();

  if (args.reallyBad)
    exception('Validation')
      .msg('custom18nMessageKey')
      .field({
        in: 'application', // can be anything
        name: ['field1', 'field2'],
        msg: 'dataNoGood',
      })
      .throw();
}
```
