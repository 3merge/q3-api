const { readdirSync } = require('fs');
const { join, resolve } = require('path');
const mongoose = require('mongoose');
const session = require('q3-core-session');
const pluralize = require('pluralize');

const walk = (dir) => {
  const p = join(dir, './sources');

  const getSources = () => {
    try {
      return readdirSync(p);
    } catch (e) {
      return [];
    }
  };

  return getSources(p).reduce(
    (acc, curr) =>
      Object.assign(acc, {
        // eslint-disable-next-line
        [curr]: require(resolve(p, curr, 'index.js')).build(
          curr,
        ),
      }),
    {},
  );
};

const CONSTANTS = {
  STRING: String,
};

class MongooseProxy {
  constructor(schema) {
    this.__$schema = new mongoose.Schema(schema);
  }

  static of(...args) {
    return new MongooseProxy(...args);
  }

  on(eventName, eventListener) {
    const execEventListener = async (ctx) => {
      if (ctx && typeof eventListener === 'function')
        await eventListener(
          ctx,
          mongoose.models,
          session.getAll(),
        );
    };

    switch (eventName) {
      case 'find':
        this.__$schema.post('find', async (d) => {
          if (Array.isArray(d)) {
            await Promise.all(
              d.map((doc) => execEventListener(doc)),
            );
          } else {
            await execEventListener(d);
          }
        });
        this.__$schema.post('findOne', async (d) => {
          await execEventListener(d);
        });
        this.__$schema.post('findById', async (d) => {
          await execEventListener(d);
        });
        break;
      case 'query':
        this.__$schema.pre('find', () => {
          // here
        });
        break;
      case 'save':
        this.__$schema.pre('save', async function (next) {
          try {
            await execEventListener(this);
            next();
          } catch (e) {
            next(e);
          }
        });
        break;
      case 'done':
        this.__$schema.post('save', async function () {
          await execEventListener(this);
        });
        break;
      default:
        throw new Error(
          `Unknown datasource event, "${eventName}", registered`,
        );
    }

    return this;
  }

  define(prop, def) {
    this.__$schema.virtual(prop).get(function () {
      return def(this);
    });

    return this;
  }

  build(name) {
    const collectionPluralName = pluralize(name);

    Object.entries({
      restify: '*',
      collectionSingularName: name,
      collectionPluralName,
    }).forEach(([key, value]) => {
      this.__$schema.set(key, value);
    });

    return mongoose.model(
      collectionPluralName,
      this.__$schema,
    );
  }

  return() {
    return this.__$schema;
  }
}

MongooseProxy.of.CONSTANTS = CONSTANTS;

module.exports = {
  MongooseProxy,
  walk,
};
