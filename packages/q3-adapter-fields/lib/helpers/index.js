const mongoose = require('mongoose');
const { get, pick, compact } = require('lodash');
const translateInstanceType = require('./translateInstanceType');

module.exports = {
  translateInstanceType,
  getInstanceAttributes(type, options) {
    if (type === 'text') {
      const threshold = 255;
      const max = get(options, 'max', threshold);
      const multiline = max >= threshold;

      return multiline
        ? {
            multiline,
            rows: Math.ceil(threshold / 60),
          }
        : {};
    }

    if (type === 'select')
      return {
        options: compact(options.enum),
      };

    if (type === 'autocomplete') {
      const { model } = options.type.obj.ref;
      const { schema } = mongoose.models[model];

      // eslint-disable-next-line
      let { alias } = schema;

      if (schema.obj.name) alias = 'name';
      if (schema.obj.title) alias = 'title';

      return {
        endpoint: [
          `/${model}?limit=8&sort=${alias}`,
          schema.options.collectionPluralName,
          alias,
        ],
      };
    }

    if (type === 'number')
      return pick(options, ['max', 'min']);

    return {};
  },
};
