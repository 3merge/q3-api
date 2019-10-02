const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { get } = require('lodash');
const { Schema } = require('mongoose');
const ctx = require('request-context');

module.exports = (schema) => {
  const pluginSchema = {};

  const getID = () =>
    get(ctx.get('q3-session'), 'id', null);

  const getGroupID = () =>
    get(
      ctx.get('q3-session:user'),
      schema.options.ownership,
      null,
    );

  function appendSessionData() {
    const id = getID();
    if (!id)
      throw new Errors.AuthorizationError(
        Q3.translate('messages:sessionRequired'),
      );

    if (this.isNew) this.createdBy = id;
    return this;
  }

  function queryWithOwnership() {
    return {
      $or: [
        { createdBy: getID() },
        { ownedBy: getGroupID() },
      ],
    };
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
      throw new Errors.AuthorizationError(
        Q3.translate('messages:insufficientOwnership'),
      );
  }

  if (schema.options.ownership) {
    schema.pre('save', appendSessionData);
    pluginSchema.createdBy = {
      type: Schema.Types.ObjectId,
      ref: 'q3-users',
    };

    Object.assign(schema.methods, {
      hasSufficientOwnership,
    });

    Object.assign(schema.statics, {
      queryWithOwnership,
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
};
