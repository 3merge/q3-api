const { exception } = require('q3-core-responder');

module.exports = (schema) => {
  schema.pre('save', async function lockCheck() {
    const fields = [];
    const err = exception('Validation');

    schema.eachPath((name, type) => {
      if (
        type.options.lock &&
        this.isModified(name) &&
        !this.isNew
      ) {
        fields.push({
          value: this.get(name),
          msg: 'locked',
          name,
        });
      }
    });

    if (fields.length) {
      fields.forEach((field) => {
        err.field(field);
      });

      err.throw();
    }
  });
};
