# 🔌 N-Grams

This package brings n-gram, sometimes referred to as fuzzy
searching, support to Q3's underlying mongoose instance. It
requires zero project configurations other than enabling the
_gram_ schema property where applicable.

## Why not just use Regex?

In large collections, using Regex to search causes
performance problems. Unless the regex uses an anchor and is
case sensitive, all queries bypass indexing. To solve this,
we must use Mongo's $text operator, which, unfortunately,
does not provide partial matching either. We use n-grams to
break searchable text into tiny parts so that we can provide
regex-like functionality for cases like autocomplete and
autosuggest.

## Usage

This plugin automatically creates new fields in your schema.
By default, none is selectable in your queries. However,
when using a database GUI, you can identify these fields by
their _\_ngram_ suffix.

### API

In addition to configuring middleware that updates the
n-grams on text modification, this plugin ships two static
methods.

| Name                               | Description                                      | Arguments | Response |
| ---------------------------------- | ------------------------------------------------ | --------- | -------- |
| `getFuzzyQuery`                    | Returns a `$text` query when given a search term | `String`  | `Object` |
| `initializeFuzzySearching (async)` | Creates n-grams for an existing collection       |           |          |

### Example

```javascript
const mongoose = require('mongoose');
const plugin = require('q3-plugin-ngrams');

const Schema = new mongoose.Schema({
  sample: {
    type: String,
    // this field is now $text searchable
    gram: true,
  },
});

// only required if you're not using q3-core-rest
Schema.plugin(plugin);

const Model = mongoose.model('test', Schema);

(async () => {
  const search = Model.getFuzzyQuery('foo');
  const res = await Model.find(search).exec();
  console.log(res);
})();
```
