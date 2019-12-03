/* eslint-disable func-names */
const mongoose = require('mongoose');
const micromatch = require('micromatch');
const Comparison = require('comparisons');
const { get } = require('lodash');
const { exception } = require('q3-core-responder');

const getUserRole = (user) => (user ? user.role : 'Public');

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
      .setOptions({ system: true })
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

  static async getReadOnlyFieldProps(coll, user) {
    try {
      const role = getUserRole(user);
      const doc = await this.findOne({
        active: true,
        op: 'Read',
        role,
        coll,
      })
        .setOptions({ system: true })
        .select('fields ownershipConditions')
        .exec();

      doc.testOwnership(user);
      return doc.fields;
    } catch (e) {
      return '!*';
    }
  }

  static async hasGrant(coll, op, user) {
    const role = getUserRole(user);
    const doc = await this.findOne({
      active: true,
      role,
      coll,
      op,
    })
      .setOptions({ system: true })
      .exec();

    if (!doc)
      exception('Authorization')
        .msg('noPermission')
        .throw();

    doc.testFields(doc);
    doc.testOwnership(user);

    doc.readOnly =
      op !== 'Read'
        ? await this.getReadOnlyFieldProps(coll, user)
        : doc.fields;

    return doc;
  }

  testFields() {
    if (!this.fields || this.fields === '!*')
      exception('Authorization')
        .msg('insufficientPermissions')
        .throw();
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
      !new Comparison(this.ownershipConditions).eval(
        user && 'toJSON' in user ? user.toJSON() : user,
      )
    )
      exception('Authorization')
        .msg('ownershipState')
        .throw();
  }
};
