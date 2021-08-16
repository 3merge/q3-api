/* eslint-disable func-names, no-param-reassign */
const { invoke, get } = require('lodash');
const { exception } = require('q3-core-responder');
const { clean } = require('q3-utils');
const { executeOn } = require('q3-schema-utils');

class MethodDecorators {
  static async findStrictly(id, options = {}) {
    const doc = await this.findOne({
      _id: id,
      active: true,
    })
      .setOptions({
        redact: true,
        ...options,
      })
      .exec();

    if (!doc)
      exception('ResourceNotFound').msg('missing').throw();

    return doc;
  }

  async updateSubDocuments(field, ids, args) {
    if (
      this.checkAuthorizationForTotalSubDocument(
        field,
        'Update',
      )
    )
      ids.forEach((id) => {
        try {
          return get(this, field)
            .id(id)
            .authorizeUpdateArgumentsOnCurrentSubDocument(
              clean(args),
            );
        } catch (e) {
          return null;
        }
      });

    return this.save();
  }

  async updateSubDocument(field, id, args) {
    const subdoc = await this.getSubDocument(field, id);
    subdoc.authorizeUpdateArgumentsOnCurrentSubDocument(
      clean(args),
    );

    const e = subdoc.validateSync();
    if (e) throw e;

    return this.save({
      redact: true,
      op: 'Update',
    });
  }

  async removeSubDocument(field, id) {
    const removeChild = async (v) => {
      const subdoc = this.getSubDocument(field, v);

      return new Promise((res, rej) =>
        subdoc.authorizeRemovalOnCurrentSubDocument(
          (err) => {
            if (err && !Array.isArray(id)) rej(err);
            else res(subdoc);
          },
        ),
      );
    };

    if (
      this.checkAuthorizationForTotalSubDocument(
        field,
        'Delete',
      )
    )
      await executeOn(id, removeChild);

    return this.save({
      redact: true,
      op: 'Delete',
    });
  }

  pushSubDocument(field, args) {
    let preValidationResult;

    const data = get(
      this.authorizeCreateArguments({
        [field]: args,
      }),
      field,
    );

    if (Array.isArray(this[field])) {
      this[field].push(data);
    } else {
      this[field] = [data];
    }

    try {
      preValidationResult =
        this[field][this[field].length - 1].validateSync();
    } catch (e) {
      // noop
    }

    if (preValidationResult) throw preValidationResult;

    return this.save({
      redact: true,
    });
  }

  getSubDocument(field, id) {
    const subdoc = invoke(get(this, field), 'id', id);
    if (!subdoc)
      exception('ResourceNotFound')
        .msg('subdocumentNotFound')
        .throw();

    return subdoc;
  }
}

module.exports = MethodDecorators;
