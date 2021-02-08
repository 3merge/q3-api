const mongoose = require('mongoose');
const { get } = require('lodash');
const {
  executeMiddlewareOnUpdate,
  getSync,
  getSyncPaths,
  getPreSync,
  filterByPrivateProps,
  isDefined,
  forEachCollectionAsync,
  markModifiedLocalVars,
} = require('./helpers');
const {
  assembleSyncSchemaPaths,
} = require('./helpers/assemblePaths');
const QueryMaker = require('./helpers/queryMaker');

const { ObjectId } = mongoose.Types;

const getReferenceValues = (cxt) => [
  ObjectId(cxt._id),
  cxt._id.toString(),
];

async function populateRef() {
  const sync = getSync(this);
  const fn = getPreSync(this);
  const paths = getSyncPaths(this);

  if (
    !this.ref ||
    ['null', 'undefined'].includes(this.ref)
  ) {
    this.remove();
    return;
  }

  if (this.$locals.populated || !sync || (fn && !fn(this)))
    return;

  this.$locals.populated = true;

  const lookup = await mongoose
    .model(sync)
    .findById(this.ref)
    .select(paths.join(' '))
    .lean()
    .exec();

  if (!lookup) return;

  this.set(
    paths.reduce(
      (curr, next) =>
        Object.assign(curr, {
          [next]: lookup[next],
        }),
      {},
    ),
  );
}

function updateRef(...params) {
  const next = forEachCollectionAsync(...params);

  // eslint-disable-next-line
  return executeMiddlewareOnUpdate(async function () {
    const reader = QueryMaker.setup(this);
    const values = getReferenceValues(this);

    await next((model) =>
      Object.entries(assembleSyncSchemaPaths(model.inst))
        .map(filterByPrivateProps)
        .map(reader)
        .flatMap((ref) =>
          values.flatMap((id) =>
            model.proxyUpdate(...ref(id)),
          ),
        ),
    );
  });
}

module.exports = class Builder {
  constructor(model) {
    this.$ref = model;

    this.$opts = {
      // latest versions of mongoose not interpretting this correctly
      // using plain string for now
      ref: {
        type: mongoose.Schema.Types.Mixed,
      },
    };

    return this;
  }

  static plugin(
    s,
    collections,
    resolveQueryByCollectionName,
  ) {
    s.pre('save', markModifiedLocalVars);
    s.post(
      'save',
      updateRef(collections, resolveQueryByCollectionName),
    );

    return s;
  }

  on(paths = []) {
    const s = get(this, '$ref.schema.paths', {});

    const getInstance = (v) => {
      try {
        if (v.instance === 'Embedded')
          throw new Error('Embedded schemas disallowed');
        return v.instance;
      } catch (e) {
        return mongoose.Schema.Types.Mixed;
      }
    };

    paths.forEach((next) =>
      Object.assign(this.$opts, {
        [next]: {
          type: getInstance(s[next]),
        },
      }),
    );

    return this;
  }

  set(name, options = {}) {
    if (!this.$opts || !this.$opts[name])
      throw new Error(
        `${name} not included in reference object`,
      );

    Object.assign(this.$opts[name], options);
    return this;
  }

  isRequired() {
    Object.assign(this.$opts.ref, {
      required: true,
      validate: {
        message: () => 'Reference cannot be an empty value',
        validator: isDefined,
      },
    });

    return this;
  }

  done(globalOptions = {}) {
    const output = new mongoose.Schema(this.$opts, {
      sync:
        get(this, '$ref.collection.collectionName') ||
        this.$ref,
      ...globalOptions,
      timestamps: false,
      skipPlugins: true,
    });

    output.pre('validate', populateRef);
    output.pre('save', populateRef);

    return output;
  }
};
