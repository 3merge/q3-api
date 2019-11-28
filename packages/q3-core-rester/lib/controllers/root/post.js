module.exports = async (
  { body, datasource, marshal, t },
  res,
) => {
  const doc = await datasource.create(body);
  res.create({
    message: t('messages:resourceCreated'),
    [this.collectionSingularName]: marshal(doc),
  });
};
