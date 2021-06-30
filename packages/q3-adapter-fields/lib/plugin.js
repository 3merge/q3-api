const { get } = require('lodash');
const {
  getInstanceAttributes,
  translateInstanceType,
} = require('./helpers');
const { condense } = require('./helpers/utils');

module.exports = (Schema) => {
  // eslint-disable-next-line
  Schema.statics.getFieldDesignInstructions = function (
    name,
  ) {
    const path = this.schema.path(name);
    if (!path) return null;

    const { options } = path;
    const type = translateInstanceType(path);
    const attributes = getInstanceAttributes(type, options);
    let required = get(options, 'required', false);

    if (type === 'autocomplete')
      ({ required } = path.schema.obj.ref);

    return condense({
      ...attributes,
      required,
      name,
      type,
    });
  };
};
