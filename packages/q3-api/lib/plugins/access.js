const { get } = require('lodash');
const ctx = require('request-context');
const mongoose = require('../config/mongoose');
const { translate: t } = require('../config/i18next');
const exception = require('../errors');

const { Schema } = mongoose;

mongoose.plugin((schema) => {
  const pluginSchema = {};

  const getID = () =>
    get(ctx.get('q3-session:user'), 'id', null);

  const getGroupID = () =>
    get(
      ctx.get('q3-session:user'),
      schema.options.ownership,
      null,
    );

  function appendSessionData() {
    const id = getID();
    if (!id)
      exception('AuthorizationError').throw(
        t('messages:sessionRequired'),
      );

    if (this.isNew) this.createdBy = id;
    return this;
  }

  async function compareOwnership() {
    const { ownership } = ctx.get('q3-session:grants');

    if (ownership === 'Shared')
      this.where({
        ownedBy: getGroupID(),
      });

    if (ownership === 'Own')
      this.where({
        createdBy: getID(),
      });
  }

  function hasSufficientOwnership() {
    if (
      !(
        (this.createdBy && 'equals' in this.createdBy
          ? this.createdBy.equals(getID())
          : false) ||
        (this.ownedBy && Array.isArray(this.ownedBy)
          ? this.ownedBy.some((id) =>
              id.equals(getGroupID()),
            )
          : false)
      )
    )
      exception('AuthorizationError').throw(
        t('messages:insufficientOwnership'),
      );
  }

  if (schema.options.ownership) {
    schema.pre('save', appendSessionData);
    schema.pre('find', compareOwnership);

    pluginSchema.createdBy = {
      type: Schema.Types.ObjectId,
      ref: 'q3-users',
    };

    Object.assign(schema.methods, {
      hasSufficientOwnership,
    });
  }

  if (schema.options.groupOwnership)
    pluginSchema.ownedBy = [
      {
        type: Schema.Types.ObjectId,
        ref: schema.options.groupOwnership,
      },
    ];

  schema.add(pluginSchema);
  return schema;
});
