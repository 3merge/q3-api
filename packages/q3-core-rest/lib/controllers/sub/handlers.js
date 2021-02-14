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

  async Patch(
    { marshal, params, body, parent, fieldName },
    res,
  ) {
    suggestPutRequest(parent, fieldName);

    await parent.updateSubDocument(
      fieldName,
      params.fieldID,
      body,
    );

    res.update({
      message: res.say('subResourceUpdated'),
      [fieldName]: marshal(parent[fieldName]),
    });
  },

  async PatchMany(
    { marshal, query, body, parent, fieldName },
    res,
  ) {
    suggestPutRequest(parent, fieldName);
    const ids = sanitizeQueryIds(query.ids);

    // eslint-disable-next-line
    if ('ids' in body) delete body.ids;

    if (!ids.length)
      exception('Validation')
        .msg('idsRequiredToPerformUpdate')
        .field('ids')
        .throw();

    await parent.updateSubDocuments(fieldName, ids, body);

    res.update({
      message: res.say('subResourceUpdated'),
      [fieldName]: marshal(parent[fieldName]),
    });
  },

  async Post(
    { body, marshal, files, parent, fieldName },
    res,
  ) {
    if (isSimpleSubDocument(parent, fieldName))
      exception('Conflict').msg('usePutRequest').throw();

    if (!files) {
      await parent.pushSubDocument(fieldName, body);
    } else {
      await parent.handleUpload({ files, ...body });
    }

    res.create({
      message: res.say('newSubResourceAdded'),
      [fieldName]: marshal(parent[fieldName]),
    });
  },

  async Put({ body, marshal, fieldName, parent }, res) {
    await parent.set({ [fieldName]: body }).save();

    res.create({
      message: res.say('newSubResourceAdded'),
      [fieldName]: marshal(parent[fieldName]),
    });
  },

  async Remove({ parent, fieldName, params }, res) {
    await parent.removeSubDocument(
      fieldName,
      params.fieldID,
    );

    res.acknowledge();
  },

  async RemoveMany(
    { parent, fieldName, query: { ids } },
    res,
  ) {
    await parent.removeSubDocument(fieldName, ids);
    res.acknowledge();
  },
};
