const { get } = require('lodash');
const ctx = require('request-context');
const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');

const { Schema } = mongoose;

const getFromSessionByKey = (key) =>
  get(ctx.get('q3-session:user'), key, null);

const groupName = (arg) =>
  get(arg, 'schema._userProvidedOptions.group');

class AccessHooks {
  static append() {
    if (this.isNew)
      this.createdBy = getFromSessionByKey('id');
  }

  static identify() {
    const grant = ctx.get('q3-session:grants');
    const ownership = grant ? grant.ownership : 'Own';

    if (get(this, 'options.bypassAuthorization')) return;

    if (ownership === 'Shared')
      this.where({
        ownedBy: getFromSessionByKey(groupName(this)),
      });

    if (ownership === 'Own')
      this.where({
        createdBy: getFromSessionByKey('id'),
      });
  }
}

const PluginSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: MODEL_NAMES.USERS,
  },
});

const plugin = (schema) => {
  const { ownership } = schema.options;

  if (ownership) {
    schema.pre('save', AccessHooks.append);
    schema.pre('find', AccessHooks.identify);
    schema.pre('findOne', AccessHooks.identify);
  }

  if (schema.options.group)
    PluginSchema.ownedBy = [Schema.Types.ObjectId];

  schema.add(PluginSchema);
  return schema;
};

module.exports = plugin;
