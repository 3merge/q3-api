<h1>💫 Mongoose Extended Reference and Autopopulate</h1>
<p>
  <img src="https://github.com/MikeIbberson/mongoose-field-populate/workflows/Node%20CI/badge.svg" alt="Status" />
<a href='https://coveralls.io/github/MikeIbberson/mongoose-field-populate?branch=master'><img src='https://coveralls.io/repos/github/MikeIbberson/mongoose-field-populate/badge.svg?branch=master' alt='Coverage Status' /></a>
<img src='https://bettercodehub.com/edge/badge/MikeIbberson/mongoose-field-populate?branch=master'>
</p> 

<h2>Extended Reference</h2>

<p>The extended reference builder provides a plugin for managing stale data updating as well as a builder for assembling extended references. It auto-syncs the target props on save, so you don't have to worry about matching types, setting projects and more.</p>

``` Javascript
  const mongoose = require('mongoose');
  const { ExtendedReference } = require('mongoose-field-populate');

  const ReferenceSchema = new mongoose.Schema({
    name: String,
    age: Number,
  });

  ReferenceSchema.plugin(ExtendedReference.plugin, [
    'TARGETS',
  ]);

  module.exports = mongoose.model('DEMO_ONLY', ReferenceSchema);
```

``` Javascript
  const mongoose = require('mongoose');
  const { ExtendedReference } = require('mongoose-field-populate');
  const ReferenceModel = require('./reference');

  const TargetSchema = new mongoose.Schema({
    friend: new ExtendedReference(ReferenceModel)
      .on(['name', 'age'])
      .set('name', { private: true })
      .done(),
  });

  module.exports = mongoose.model('TARGETS', TargetSchema);
```

<h2>Autopopulate</h2>

<p>This package also ships with a very basic autopopulation feature. The most common solution on NPM does not suit my needs, though it might fit nicely into your project. Use this only if you require autopopulation on discriminators or embedded arrays.</p>

``` Javascript
  const mongoose = require('mongoose');
  const { autopopulate } = require('mongoose-field-populate');
  
  const TargetSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      autopopulate: true,
      autopopulateSelect: 'projection path',
    }
  });

  TargetSchema.plugin(autopopulate)
```
