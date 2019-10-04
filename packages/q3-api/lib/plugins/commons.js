const expection = require('../errors');

const plugin = (schema) => {
  // eslint-disable-next-line
  schema.statics.findStrictly = async function(id) {
    const doc = await this.findById(id).exec();
    if (!doc)
      expection('ResourceNotFound')
        .msg('missing')
        .throw();

    return doc;
  };

  Object.assign(schema.options, {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });
};

module.exports = plugin;
