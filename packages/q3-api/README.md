# Q3 API

Many packages in this repository serve a single purpose in
your application. Q3 API brings all of those functionalities
together to reduce setup time and dependency management.
Additionally, it also configures the underlying project
dependencies such as express and mongoose.

The goal of this package is to get your app off the ground
as quickly as possible by automating many of the things that
hold new developers up: access control, routing, error
handling, task management and more. Since it sets off to do
so much, a Q3 project is very opiniated in structure.
However, when it comes to using the underlying tools like
mongoose, you have free reign over approach.

## Environment

Many Q3 packages pick up environment variables to run
without code-level configuration. The list below identifies
the essential variables you'll need to provide.

```
# Application requirements to connect to DB and run express JS
CONNECTION=
PORT=
SECRET=
WEB_CONCURRENCY=

# AWS configurations for file sharing
S3_ACCESS_KEY_ID=
S3_SECRET=
PRIVATE_BUCKET=
PUBLIC_BUCKET=
CDN=

# Mailing configurations
MAILGUN_ACCESS_TOKEN=
MAILGUN_DOMAIN=
MAILGUN_DEV_RECIPIENT=

#Documentation configurations
FRESHBOOKS_SECRET =
FRESHBOOKS_ACCOUNT_NAME =
FRESHBOOKS_ACCOUNT_EMAIL =

# Development variables
DEBUG_CONTROLLER=true
```

## Project structure

After installing your `node_modules`, you should setup a few
crucial files and folders. In the tree below, notice that
`views` does not exist -- this framework is headless and
does not deal with the presentation layer. For this reason,
we've placed an empty `client` directory at the top of the
project, which you can populate however you like.

For <a href="../q3-core-scheduler">`chores`</a>,
<a href="../q3-locale">`lang`</a> and
<a href="../q3-core-walker">`routes`</a>, you'll need to
follow a precise structure as well. Click the embedded links
to learn more on each. Similarly,
<a href="../q3-core-access">click here to learn about the
access control JSON file</a>.

```
📦 client
📦 server
 ┣ 📂 tests
 ┣ 📂 lib
 ┃ ┣ 📂 chores
 ┃ ┣ 📂 lang
 ┃ ┣ 📂 helpers
 ┃ ┣ 📂 models
 ┃ ┣ 📂 routes
 ┃ ┣ 📜 config.js
 ┃ ┣ 📜 index.js
 ┃ ┗ 📜 worker.js
 ┣ 📜 q3-access.json
 ┗ 📜 package.json
```

### config.js

An out-of-the-box implementation of Q3 will need very little
code to run. The configuration file will only grow in size
if there are custom requirements surrounding things like the
working directory and CORS policy.

```javascript
const Q3 = require('q3-api');
const onCors = require('./helpers/cors.js');
const messages = require('./lang/messages.json');

require('dotenv').config();
require('./models');

module.exports = Q3.config({
  enableServerToServer: true,
  location: __dirname,
  messages,
  onCors,
});
```

| Property               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         | Accepted values  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `enableServerToServer` | Unless truthy, requests made to the API without an origin will be denied.                                                                                                                                                                                                                                                                                                                                                                           | `Boolean`        |
| `location`             | If your working directory is not in the same location as your `package.json` file, you'll need to provide Q3 with the directory root.                                                                                                                                                                                                                                                                                                               | `String`         |
| `messages`             | Any route that Q3 automates will send a standard message back to the client. For example, on PATCH 200, the app will include some sort of acknowledgement message the request was successful. To tailor these messages, you can provide an object that specifies the collection name, the sub-document (if required) and the operation to overwrite. For example, part of the Object might look like: `{ collectionNamePlural: { post: 'Woot!' } }` | `Object`         |
| `onCors`               | If the environment variable `WHITELIST_CORS` is undefined, then CORS will allow all requests through. If your app requires a dynamic policy, then you can combine the whitelist along with a resolving function. This function receives the origin's value so that you can programmatically accept or deny based on the value.                                                                                                                      | `async Function` |

### index.js

Typically, `index.js` requires `config.js` and only deals
with connecting to the database. This separation is
important for developers who intend to run integration
testing tools like `supertest`. Otherwise, you can delete
`config.js` and include its code here instead.

```javascript
const Q3 = require('q3-api');
const config = require('./config');

config.connect().catch((e) => {
  console.log(e);
});
```

### worker.js

Mostly, the worker file just calls a Q3 script with the
location of the app's root so that it may call chore
functions automatically. As described in
<a href="../q3-core-scheduler">`q3-core-scheduler`</a>, when
a chore executes, it will look for a file with a
corresponding name. So, if `/chores/example.js` exists and a
chore named "example" runs, then Q3 can dynamically run that
file.

```javascript
require('q3-api/lib/startQueue')(__dirname);
```

## Methods

Now that you've got your app setup, you can start adding
some business logic. Q3 ships with a few utilities to help
in this respect too.

### Mongoose abstractions

Many of mongoose's common methods can be invoked directly
through Q3. This is mandatory in cases like `connect` and
more up to convenience for the rest.

#### `connect`

**_Do not call this method with a connection string unless
for testing._**

Using the `CONNECTION` environment variable, this method
will connect to our database using mongoose's driver and
setup the application. By default, the application will
cluster over however many instances specified by the
`WEB_CONCURRENCY` environment variable. It will also setup
the `changestream` app variable, which is a custom
`EventEmitter` that integrates with mongoose's `watch`
feature.

#### `getSchemaType`

Q3 appends some common Schema Types to mongoose. You can
call them directly like `mongoose.Schema.Types.Email` or
using `Q3.getSchemaType('email')`. For all possible values,
please reference our
<a href="../q3-schema-types">q3-schema-types</a> package.

#### `model`

Calling `Q3.model()` allows you to lookup any mongoose model
without needing to resolve the file path in your code. For
example, we can invoke a query on the Characters model by
calling `Q3.model('characters').find()`.

#### `setModel`

Much like the method above, this is just a short cut when
creating models in mongooses. It takes the same parameters :
name<`String`> and schema<`Object`>.

#### `saveToSessionDownloads`

Docs coming soon.

#### `saveToSessionNotifications`

Docs coming soon.

### Utils

Docs coming soon.
