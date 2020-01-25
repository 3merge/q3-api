const { exception } = require('q3-core-responder');
const aqp = require('api-query-params');
const { sortBy } = require('lodash');
const sift = require('sift');
const { isSimpleSubDocument } = require('../../utils');

module.exports = {
  async List({ subdocs, fieldName, marshal, query }, res) {
    const { filter } = aqp(query !== null ? query : {});

    res.ok({
      [fieldName]: marshal(
        sortBy(
          subdocs.filter(sift(filter)),
          (o) => o.updatedAt,
        ),
      ),
    });
  },

  async Patch(
    { marshal, params, body, t, parent, fieldName },
    res,
  ) {
    if (isSimpleSubDocument(parent, fieldName))
      exception('Conflict')
        .msg('usePutRequest')
        .throw();

    await parent.updateSubDocument(
      fieldName,
      params.fieldID,
      body,
    );

    res.update({
      message: t('messages:subResourceUpdated'),
      [fieldName]: marshal(parent[fieldName]),
    });
  },

  async Post(
    { t, body, marshal, files, parent, fieldName },
    res,
  ) {
    if (isSimpleSubDocument(parent, fieldName))
      exception('Conflict')
        .msg('usePutRequest')
        .throw();

    if (!files) {
      await parent.pushSubDocument(fieldName, body);
    } else {
      await parent.handleUpload({ files, ...body });
    }

    res.create({
      message: t('messages:newSubResourceAdded'),
      [fieldName]: marshal(parent[fieldName]),
    });
  },

  async Put({ t, body, marshal, fieldName, parent }, res) {
    await parent.set({ [fieldName]: body }).save();

    res.create({
      message: t('messages:newSubResourceAdded'),
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
