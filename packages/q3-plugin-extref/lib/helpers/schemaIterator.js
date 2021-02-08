const { isObject, isFunction, get } = require('lodash');

const hasSchemaOption = (childSchema, option) =>
  Boolean(get(childSchema, `schema.options.${option}`));

const isEmbedded = (childSchema) =>
  get(childSchema, 'model.name') === 'EmbeddedDocument';

const SchemaIterator = (
  schema,
  option,
  initialStateValue,
) => {
  const store = initialStateValue;

  return {
    end: () =>
      Array.isArray(store) ? store.flat(3) : store,

    transform(nextValues) {
      if (Array.isArray(store)) {
        if (Array.isArray(nextValues))
          nextValues.forEach((item) => store.push(item));
        else store.push(nextValues);
      } else if (isObject(nextValues)) {
        Object.assign(store, nextValues);
      }

      return this;
    },

    init(cb) {
      if (
        hasSchemaOption({ schema }, option) &&
        isFunction(cb)
      )
        this.transform(cb(schema));

      return this;
    },

    forEachPath(cb) {
      schema.eachPath((pathname, localSchema) => {
        if (
          hasSchemaOption(
            { schema: localSchema },
            option,
          ) &&
          isFunction(cb)
        )
          this.transform(cb(pathname, localSchema));
      });

      return this;
    },

    forEachEmbeddedPath(cb) {
      get(schema, 'childSchemas', []).forEach((c) => {
        if (isEmbedded(c) && isFunction(cb))
          this.transform(cb(c));
      });

      return this;
    },

    forEachSimpleDocument(cb) {
      get(schema, 'childSchemas', []).forEach((c) => {
        if (
          !isEmbedded(c) &&
          hasSchemaOption(c, option) &&
          isFunction(cb)
        )
          this.transform(cb(c));
      });

      return this;
    },
  };
};

module.exports = SchemaIterator;
