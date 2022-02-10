<p><img alt="3merge" src="https://github.com/3merge/q3-client/blob/master/logo.png" width="22" /></p>
<h1>Q3 API</h1>
<p>Q3 is a set of packages for scaffolding APIs.</p>
<h2>🕮 Core Documentation</h2>

| Name                                                   | Description                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| <a  href="/packages/q3-core-access">Access Control</a> | Maintains all CRUD permissions for the API and DB                   |
| <a  href="/packages/q3-api">API</a>                    | The primary package of this project                                 |
| <a  href="/packages/q3-core-composer">Composer</a>     | Generates REST endpoints with baked in authorization and validation |
| <a  href="/packages/q3-exports">Exports</a>            | Generates simple `csv`, `xlsx` and `pdf` files                      |
| <a  href="/packages/q3-core-responder">Responder</a>   | Helps report custom and intentional errors over the API             |
| <a  href="/packages/q3-core-scheduler">Scheduler</a>   | Manages a worker queue for background tasking                       |

<h2>🔌 Plugin Documentation</h2>

| Name                                                          | Description                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| <a  href="/packages/q3-plugin-changelog">Changelog</a>        | Saves changes made to a document in a separate collection  |
| <a  href="/packages/q3-plugin-extref">Extended References</a> | Handles extended collection references and auto-population |
| <a  href="/packages/q3-plugin-ngrams">N-grams</a>             | Handles mongoose fuzzy searching and text indexing         |

<h2>🛤️ Versions</h2>
<p>Note that starting in v2, the collection `q3-api-users` has been renamed to `users`. See `q3-api` docs for more details.</p>

| Name                                                         | Key changes                   |
| ------------------------------------------------------------ | ----------------------------- |
| <a  href="https://github.com/3merge/q3-api/tree/v2.x">V2</a> | Support multi-tenancy         |
| <a  href="https://github.com/3merge/q3-api/tree/v1.x">V1</a> | Upgrade critical dependencies |
