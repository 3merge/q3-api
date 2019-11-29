/* eslint-disable func-names */
const mongoose = require('mongoose');
const micromatch = require('micromatch');
const { get } = require('lodash');
const { exception } = require('q3-core-responder');
const StatementReader = require('./utils');

module.exports = class PermissionDecorators {
  static async isUnique(next) {
    const { role, op, coll, isNew } = this;
    let err;

    try {
      await this.isValid();
    } catch (e) {
      err = e;
    }

    const doc = await this.constructor
      .findOne({
        coll,
        op,
        role,
      })
      .lean()
      .exec();

    if (doc && isNew)
      err = exception('Conflict')
        .msg('duplicate')
        .field('coll')
        .field('role')
        .field('op')
        .boomerang();

    next(err);
  }

  static async hasGrant(coll, op, user) {
    const role = user ? user.role : 'Public';
    const doc = await this.findOne({
      active: true,
      role,
      coll,
      op,
    })
      .setOptions({ bypassAuthorization: true })
      .lean()
      .exec();

    if (!doc || !doc.fields)
      exception('Authorization')
        .msg('insufficientPermissions')
        .throw();

    doc.testOwnership(user);
    return doc;
  }

  isValid() {
    const { coll, op, fields = '' } = this;
    const Ref = get(mongoose, `models.${coll}`);

    if (!Ref)
      exception('Validation')
        .msg('unknownCollection')
        .field('coll')
        .throw();

    if (
      op === 'Create' &&
      !micromatch.every(
        Ref.getRequiredFields(),
        fields.split(',').map((i) => i.trim()),
      )
    )
      exception('Validation')
        .msg('fieldPermissions', {
          fields: Ref.getRequiredFields().join(','),
        })
        .field('fields')
        .throw();
  }

  testOwnership(user) {
    if (
      !Array.isArray(this.ownershipConditions) ||
      !this.ownershipConditions.length
    )
      return;

    if (
      typeof user !== 'object' ||
      !Object.keys(user).length ||
      !new StatementReader(
        this.ownershipConditions,
      ).compare(user)
    )
      exception('Authorization')
        .msg('ownershipState')
        .throw();
  }
};
