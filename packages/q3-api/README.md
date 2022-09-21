# Q3 API

Many packages in this repository serve a single purpose in
your application. Q3 API brings all of those functionalities
together to reduce setup time and dependency management.
Additionally, it also configures the underlying project
dependencies such as Express and Mongoose.

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
ARCHITECTURE=multitenant

# AWS configurations for file sharing
S3_ACCESS_KEY_ID=
S3_SECRET=
PRIVATE_BUCKET=
PUBLIC_BUCKET=
CDN=

# Mailing configurations
MAILER_STRATEGY=
MAILER_FROM=
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
 ┃ ┣ 📜 globals.js
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

### globals.js

If your project contains a `global.js` file, then Q3 will
parse its exported functions and load them into the global
namespace. However, to limit namespace pollution,
unrecognized functions will be discarded. Here are some that
you can use safely:

- `getMailerVars`

Each function corresponds to a configuration option outlined
elsewhere in the documentation. Typically, global functions
handle runtime changes to environment variables or overwrite
default arguments in private/internal modules.

### index.js

Typically, `index.js` requires `config.js` and only deals
with connecting to the database. This separation is
important for developers who intend to run integration
testing tools like `supertest`. Otherwise, you can delete
`config.js` and include its code here instead.

Note that you can insert global functionality at the top of
the file, before requiring/importing your config. Below,
you'll see examples of two cases this might be useful.

```javascript
// if you're coming from v2, you might need to revert the collection name
require('q3-api/lib/constants').change(
  'MODEL_NAMES',
  'USERS',
  'q3-api-users',
);

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

Like `index.js`, you may need to insert some global plugins
in this file since it runs independent of the web server.

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

## Utils

Docs coming soon.

## Scripts

### `build-access`

Since Q3 reads its permissions from a single file,
`q3-access.json`, you'll want to use `yarn build-access` to
compile a source directory rather than managing this file
directly. The system expects the folder `accessJson` at the
root of your project, containing one file per role (i.e.
"Administrator.json"). Running this script will compile the
directory or initialize it if missing.

### `build-locale`

Unlike access control, language reads from the database.
However, developers can manage defaults from the file
system. Running this script will upload the framework's
default language keys as well as any custom keys found in
the file system. The expected path per namespace is
`lib/lang/:langKey/:namespace.json`.

```shell
yarn build-locale --overwrite true --applyToAll true
```

#### Arguments

| Argument     | Expected Value | Description                                                                                                                |
| ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `applyToAll` | `Boolean`      | Should this apply to all languages? This is useful when setting up defaults that an end-user will translate in production. |
| `lang`       | `String`       | The namespace to target                                                                                                    |
| `overwrite`  | `Boolean`      | Should the file system overwrite what's already in the database?                                                           |

### `seed-login`

Create a system domain/tenant and Administrator user. This
will allow you to setup `q3-client` without much effort.

```shell
yarn seed-login --email foo@bar.net
```

#### Arguments

| Argument | Expected Value | Description                               |
| -------- | -------------- | ----------------------------------------- |
| `email`  | `String`       | The users' email to verify and login with |

### `seed-emails`

To dispatch rather critical workflows, such as password
reset and account verification, you'll need a few email
templates. Run this script to populate the database so that
you have all the required templates and partials to work
off.

## Routes

Q3 includes a few common API routes. These deal with core
functionalities like authentication, auditing and logging.

**Note that all routes, both automated and client-made,
accept custom headers for controlling content and
authorization. See the table below for more information.**

| Header             | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `Authorization`    | Takes either a Bearer or Apikey token.                          |
| `Content-Language` | Changes the locale of the API and domain.                       |
| `X-Session-Nonce`  | Used to decrypt bearer tokens.                                  |
| `X-Session-Tenant` | Used to target a tenant. Necessary if there's multiple domains. |

### GET /audit

Get a full changelog for a document. This includes all user-
and system-caused effects. **The requesting user must have
access to the `audit` collection as well as the collection
being audited.**

#### Params

| Parameter         | Description                               | Type                                 |
| ----------------- | ----------------------------------------- | ------------------------------------ |
| `id*`             | The document ID to audit                  | `ID`                                 |
| `collectionName*` | The collection which the document belongs | `String`                             |
| `search`          | A data path (i.e. "items.name" )          | `String`                             |
| `date`            | The last date to check for changes        | `Date`                               |
| `operation`       | The type of change recorded               | `String (added, deleted or updated)` |
| `skip`            | How many sets to skip (batches of 150)    | `Number`                             |
| `user`            | The user ID of who made the change        | `ID`                                 |

#### Response

The API will return an array of changes. Each will include a
date, the user involved as well as an "added", "deleted"
and/or "updated" payload. When data has been modified, there
will also be a "previous" object to help with comparisons.

```json
{
  "changes": [
    {
      "added": {
        "name": "Testing"
      },
      "date": "2021-10-08T13:35:18.020Z",
      "user": {
        "_id": "1234",
        "firstName": "Jon",
        "lastName": "Doe"
      }
    }
  ]
}
```

### GET /audit-users

Get all users who have made a change to a particular
document. **The requesting users must have access to the
`audit` collection, the collection being audited and the
`q3-api-users` collection.**

#### Params

| Parameter         | Description                               | Type     |
| ----------------- | ----------------------------------------- | -------- |
| `id*`             | The document ID to audit                  | `ID`     |
| `collectionName*` | The collection which the document belongs | `String` |

#### Response

The API will return an array of users. The data is limited
to just name, email and ID.

```json
{
  "users": [
    {
      "_id": "1234",
      "name": "Jon Doe",
      "email": "jon.doe@gmail.com"
    }
  ]
}
```

### GET /system-segments

Pull a list of _segments_, which contains saved filters for
each collection. Developers will see all possible segments,
whereas other roles types will only see those applicable
(see `visibility` field). Currently, there are no queries or
parameters for this route.

Note that the segments' order will descend by creation date
or mimic the last saved re-sort. See `PUT` for more
information.

#### Response

```json

{
	"segments": [
		{
			"collectName": "test",
			"label": "Segment #1",
			"value": "?queryparam=string(foo)",
			"folder": false,
			"folderId" null,
			"id": 1,
      "visibility": ["Administrator", "Sales"]
		}
	]
}

```

### PUT /system-segments

Modify one or many segments inside a collection. Only
developers can perform this operation.

#### Params

| Parameter         | Description                 | Type                                                              |
| ----------------- | --------------------------- | ----------------------------------------------------------------- |
| `action*`         | What to do with the payload | `String (create,remove,rename,replace,reorder,replaceVisibility)` |
| `collectionName*` | The collection to target    | `String`                                                          |
| `payload`         |                             | `Object`                                                          |

Typically, the payload just contains a single segment. That
means the `id` field is expected along with whatever
property being editted. For instance:

```json
{
	"action" "rename",
	"collectionName": "foo",
	"payload": {
		"id": 1,
    "label": "New value",
	}
}
```

Possible properties to edit include `label`, `value` and
`visibility`. For re-ordering, simply provide a list of just
`id` and `folderId` values in the anticipated order:

```json
{
	"action" "rename",
	"collectionName": "foo",
	"payload": {
		"entries": [
			{
				"id": 1,
				"folderId": null,
			}
		],
	}
}
```

Note that reordering expects all segments within a
collection; omitting any deletes them. The `PUT` response
looks like the `GET` for this route, but the data contains
only segments for the modified collection.
