const { get } = require('lodash');
const ctx = require('request-context');
const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');

const { Schema } = mongoose;

class AccessHooks {
  static append() {
    if (this.isNew)
      this.createdBy = get(
        ctx.get('q3-session'),
        'user.id',
        null,
      );
  }

  static identify() {
    const { bypassAuthorization } = this.options;
    const session = ctx.get('q3-session');
    const user = get(session, 'user', {});
    const grant = get(session, 'grants', {});
    const { ownershipAliases = [] } = grant;
    const { ownership } = grant;

    if (!user || bypassAuthorization || ownership === 'Any')
      return;

    if (ownershipAliases.length) {
      this.or([
        ...ownershipAliases.map(({ foreign, local }) => ({
          [local]: user[foreign],
        })),
        { createdBy: user.id },
      ]);
    } else {
      this.where({
        createdBy: user.id,
      });
    }
  }
}

const PluginSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: MODEL_NAMES.USERS,
    private: true,
  },
});

module.exports = (schema) => {
  if (schema.disableOwnership) return;

  schema.pre('save', AccessHooks.append);
  schema.pre('count', AccessHooks.identify);
  schema.pre('countDocuments', AccessHooks.identify);
  schema.pre('find', AccessHooks.identify);
  schema.pre('findOne', AccessHooks.identify);
  schema.add(PluginSchema);
};
