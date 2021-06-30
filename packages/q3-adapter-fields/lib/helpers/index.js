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
      return {
        model: options.type.obj.ref.model,
      };
    }

    if (type === 'number')
      return pick(options, ['max', 'min']);

    return {};
  },
};
