module.exports = async (
  {
    body,
    collectionSingularName,
    datasource,
    marshal,
    params,
    t,
    isFresh,
  },
  res,
) => {
  const doc = await datasource.findStrictly(
    params.resourceID,
  );
  if (isFresh(doc.updatedAt)) {
    const output = await doc.set(body).save();
    res.update({
      message: t('messages:resourceUpdated'),
      [collectionSingularName]: marshal(output),
    });
  }
};
