const { exception } = require('q3-core-responder');
const aqp = require('api-query-params');
const { executeOn } = require('q3-schema-utils');
const sift = require('sift');
const { isSimpleSubDocument } = require('../../utils');

const suggestPutRequest = (parent, fieldName) => {
  if (isSimpleSubDocument(parent, fieldName))
    exception('Conflict').msg('usePutRequest').throw();
};

const sanitizeQueryIds = (ids) =>
  executeOn(ids, (v) =>
    typeof v === 'string'
      ? v.split(',').map((item) => item.trim())
      : v,
  ).flat();

module.exports = {
  async List({ subdocs, fieldName, marshal, query }, res) {
    const { filter } = aqp(query !== null ? query : {});

    res.ok({
      [fieldName]: marshal(subdocs.filter(sift(filter))),
    });
  },

  async Patch({
    params,
    authorizeBody,
    parent,
    fieldName,
  }) {
    suggestPutRequest(parent, fieldName);

    await parent.updateSubDocument(
      fieldName,
      params.fieldID,
      authorizeBody(parent),
    );

    return {
      data: parent,
      message: 'subResourceUpdated',
      defaultResponseRouter: 'update',
    };
  },

  async PatchMany({
    authorizeBody,
    query,
    body,
    parent,
    fieldName,
  }) {
    suggestPutRequest(parent, fieldName);
    const ids = sanitizeQueryIds(query.ids);

    // eslint-disable-next-line
    if ('ids' in body) delete body.ids;

    if (!ids.length)
      exception('Validation')
        .msg('idsRequiredToPerformUpdate')
        .field('ids')
        .throw();

    await parent.updateSubDocuments(
      fieldName,
      ids,
      authorizeBody(parent),
    );

    return {
      data: parent,
      message: 'subResourceUpdated',
      defaultResponseRouter: 'update',
    };
  },

  async Post({ authorizeBody, files, parent, fieldName }) {
    if (isSimpleSubDocument(parent, fieldName))
      exception('Conflict').msg('usePutRequest').throw();

    const body = authorizeBody(parent);

    if (!files) {
      await parent.pushSubDocument(fieldName, body);
    } else {
      await parent.handleUpload({ files, ...body });
      await parent.save();
    }

    return {
      data: parent,
      message: 'newSubResourceAdded',
      defaultResponseRouter: 'create',
    };
  },

  async Put({ authorizeBody, fieldName, parent }) {
    await parent
      .set({ [fieldName]: authorizeBody(parent) })
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

  async RemoveMany({ parent, fieldName, query: { ids } }) {
    await parent.removeSubDocument(fieldName, ids);
    return {
      data: parent,
      message: 'subResourceRemoved',
      defaultResponseRouter: 'acknowledge',
    };
  },
};
