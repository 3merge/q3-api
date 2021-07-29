const mongoose = require('mongoose');
const { size } = require('lodash');

module.exports = (modelName, path) => {
  try {
    const schemaType = mongoose
      .model(modelName)
      .schema.path(path);

    const { name } = schemaType.constructor;

    const reducePaths = () => {
      const out = Object.entries(schemaType.schema.paths)
        .filter(([, value]) => value.isRequired)
        .map(([key]) => `${path}.${key}`);

      return size(out) ? out : path;
    };

    return name === 'DocumentArrayPath' ||
      name === 'SingleNestedPath'
      ? reducePaths()
      : path;
  } catch (e) {
    return path;
  }
};
