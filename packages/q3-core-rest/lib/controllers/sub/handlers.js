module.exports = {
  async List({ subdocs, fieldName, marshal }, res) {
    res.ok({
      [fieldName]: marshal(subdocs),
    });
  },

  async Patch(
    { marshal, params, body, t, parent, fieldName },
    res,
  ) {
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
