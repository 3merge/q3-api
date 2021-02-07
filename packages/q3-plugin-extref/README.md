# Extended Reference and Autopopulate Plugin

This plugin implements the
[Extended Reference Pattern](https://www.mongodb.com/blog/post/building-with-patterns-the-extended-reference-pattern)
to reduce lookups in your code. It connects to Mongoose's
save middleware, so it will not fire on update operations.
It also relies on Q3's archiving functionality, so it will
only pull or unset on specific document changes.

```Javascript
// FILE #1
const  mongoose = require('mongoose');
const { ExtendedReference } = require('q3-plugin-extref');

const  ReferenceSchema = new  mongoose.Schema({
    name:  String,
    age:  Number,
});

// tells the plugin which collections to update on save
ReferenceSchema.plugin(ExtendedReference.plugin, [
    'TARGETS',
]);

module.exports = mongoose.model('DEMO_ONLY', ReferenceSchema);

// FILE #2
const  mongoose = require('mongoose');
const { ExtendedReference } = require('q3-plugin-extref');
const  ReferenceModel = require('./reference');

const  TargetSchema = new  mongoose.Schema({
  friend:  new  ExtendedReference('DEMO_ONLY')
    .on(['name', 'age'])
    .set('name', { private:  true })
    .done(),

  // Saves as:
  // {
  //   ref: ObjectId(),
  //   name: 'Example',
  //   age: 21
  // }
});

module.exports = mongoose.model('TARGETS', TargetSchema);

```

Alternatively, this plugin also ships with a very basic
autopopulation feature.

```Javascript
const  mongoose = require('mongoose');
const { autopopulate } = require('q3-plugin-extref');

const  TargetSchema = new  mongoose.Schema({
    email: {
        type:  String,
        unique:  true,
        autopopulate:  true,
        autopopulateSelect:  'projection path',
        ref: 'DEMO_ONLY'
    }
});

TargetSchema.plugin(autopopulate)
```
