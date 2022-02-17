const aqp = require('api-query-params');
const { get } = require('lodash');
const sift = require('sift');
const { decorate } = require('q3-utils');

const SubControllHandlers = {
  async List(
    { subdocs, fieldName, marshal, query, parent },
    res,
  ) {
    const { filter } = aqp(query !== null ? query : {});
    parent.checkAuthorizationForTotalSubDocument(
      fieldName,
      'Read',
    );

    res.ok({
      [fieldName]: Array.isArray(subdocs)
        ? marshal(subdocs.filter(sift(filter)))
        : marshal(subdocs),
    });
  },

  async Patch({ body, params, parent, fieldName }) {
    await parent.updateSubDocument(
      fieldName,
      params.fieldID,
      body,
    );

    return {
      data: parent,
      message: 'subResourceUpdated',
      defaultResponseRouter: 'update',
    };
  },

  async PatchMany({ body, parent, fieldName, ids }) {
    await parent.updateSubDocuments(fieldName, ids, body);

    return {
      data: parent,
      message: 'subResourceUpdated',
      defaultResponseRouter: 'update',
    };
  },

  async Post({ body, files, parent, fieldName }) {
    if (!files) {
      await parent.pushSubDocument(fieldName, body);
    } else {
      parent.checkAuthorizationForTotalSubDocument(
        fieldName,
        'Create',
      );

      await parent.handleUpload({ files, ...body });
      await parent.save();
    }

    return {
      data: parent,
      message: 'newSubResourceAdded',
      defaultResponseRouter: 'create',
    };
  },

  async Put({ body, fieldName, parent }) {
    await parent
      .set({
        [fieldName]: get(
          parent.authorizeCreateArguments({
            [fieldName]: body,
          }),
          fieldName,
        ),
      })
      .save();

    return {
      data: parent,
      message: 'newSubResourceAdded',
      defaultResponseRouter: 'create',
    };
  },

  async Remove({ parent, fieldName, params }) {
    await parent.removeSubDocument(
      fieldName,
      params.fieldID,
    );

    return {
      data: parent,
      message: 'subResourceRemoved',
      defaultResponseRouter: 'acknowledge',
    };
  },

  async RemoveMany({ parent, fieldName, ids }) {
    await parent.removeSubDocument(fieldName, ids);

    return {
      data: parent,
      message: 'subResourceRemoved',
      defaultResponseRouter: 'acknowledge',
    };
  },
};

const decorateWithMethodValidation = (xs) =>
  decorate(
    xs,
    ['Patch', 'PatchMany', 'Post'],
    // eslint-disable-next-line
    require('./methodValidation'),
  );

const decorateWithQueryValidation = (xs) =>
  decorate(
    xs,
    ['PatchMany', 'RemoveMany'],
    // eslint-disable-next-line
    require('./queryValidation'),
  );

module.exports = decorateWithMethodValidation(
  decorateWithQueryValidation(SubControllHandlers),
);
