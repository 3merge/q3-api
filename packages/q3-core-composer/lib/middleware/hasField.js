const mongoose = require('mongoose');

module.exports = (modelName, path) => {
  try {
    const schemaType = mongoose
      .model(modelName)
      .schema.path(path);

    const { name } = schemaType.constructor;

    return name === 'DocumentArrayPath' ||
      name === 'SingleNestedPath'
      ? Object.entries(schemaType.schema.paths)
          .filter(([, value]) => {
            return value.isRequired;
          })
          .map(([key]) => {
            return `${path}.${key}`;
          })
      : path;
  } catch (e) {
    return path;
  }
};
