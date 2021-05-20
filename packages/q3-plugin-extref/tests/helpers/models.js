/* eslint-disable func-names,no-param-reassign */
module.exports = (Schema) => {
  Schema.add({});

  Schema.statics.archive = async function (id) {
    const doc = await this.findById(id);
    return doc.remove();
  };

  Schema.statics.findByIdAndModify = async function (
    id,
    update,
  ) {
    const doc = await this.findById(id);
    return doc ? doc.set(update).save() : null;
  };

  Schema.methods.expectPathToHaveProperty = async function (
    path,
    expectedValue,
  ) {
    const doc = await this.constructor.findById(this._id);
    expect(doc).toHaveProperty(path, expectedValue);
    return doc;
  };

  Schema.methods.expectPathNotToHaveProperty = async function (
    path,
  ) {
    const doc = await this.constructor.findById(this._id);
    expect(doc).not.toHaveProperty(path);
    return doc;
  };

  return Schema;
};
