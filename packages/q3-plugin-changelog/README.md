# Changelog Plugin

Leveraging MongoDB's changestream, this plugin aims to track
choice modifications to a document after they occur. When
globally installed, the plugin will automatically watch for
changes in a collection and save their
<a href="https://www.npmjs.com/package/deep-diff">Deep
Diff</a> results. It also synchronizes with Q3 session data
so that we can see who prompted the change and when.

## Example usage

```Javascript
const  mongoose = require('mongoose');
const plugin = require('q3-plugin-changestream')
const watcher = require('q3-plugin-changestream/lib/changestream')

const Person = new  mongoose.Schema({
	name:  String,
	friends: [
		{
			since: Date,
		}
	]
}, {
	changelog: ['name', 'friends.$.since'],
});

Person.plugin(plugin);

// Must happen after all model has been declared.
// More than likely, you'll call this from a different file after a DB connection has been made.
watcher()
```

## API

### `async Document.getHistory`

Call this method to fetch all records created by the plugin.

### `Model.getChangelogProperties`

Call this static method to get a list of properties the
plugin is watching. Essentially, it just references the
initial changelog value setup in the Schema.
