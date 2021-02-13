# Adapter Mongoose JS

**_Currently, Mongoose is the only database adapter Q3
supports. That's unlikely to change given the number of
schemas and plugins we've designed exclusively for it._**

## Configuration notes

Under the hood, we install many useful plugins that you'll
inevitably rely on in your client projects. We also keep
your mongoose's instance options up-to-date to avoid those
dreaded deprecation notices. Some features available through
this adapter include:

- Access control
- Lean virtual
- Deduplication
- Field locking
- Auto-population
- Version control
- Commenting
- File uploading
- And more

### Methods and utilities

Note that these docs are unfinished. We need refactor the
plugin from `q3-schema-utils` and bring it into this
adapter, as there are dozens of custom mongoose methods
extended to each model not listed here.

#### `Subscribe`

| Method      | Description                                                                      | Params     |
| ----------- | -------------------------------------------------------------------------------- | ---------- |
| `init`      | Discover all mongoose models and attach event listeners to each's change stream. | ``         |
| `onLeave`   | Unsubscribe from the change stream.                                              | `Function` |
| `onRefresh` | Subscribe to the change stream.                                                  | `Function` |

#### `makeExtendedReference`

Rather than installing `q3-plugin-extref` locally, this
adapter exposes the key class needed for use in your
projects. It will instantiate it for you and return all the
<a href="../q3-plugin-extref">methods documented here</a>.

#### `getSchemaType`

Q3 appends some common Schema Types to mongoose. You can
call them directly like `mongoose.Schema.Types.Email` or
using `getSchemaType('email')`. For all possible values,
please reference our
<a  href="../q3-schema-types">q3-schema-types</a> package.

#### `model`

Calling `model()` allows you to lookup any mongoose model
without needing to resolve the file path in your code. For
example, we can invoke a query on the Characters model by
calling `model('characters').find()`.

#### `setModel`

Much like the method above, this is just a short cut when
creating models in mongoose.
