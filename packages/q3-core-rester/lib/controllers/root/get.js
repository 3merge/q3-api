module.exports = async (
  { datasource, collectionSingularName, params, marshal },
  res,
) => {
  const doc = await datasource.findStrictly(
    params.resourceID,
  );

  res.ok({
    [collectionSingularName]: marshal(doc),
  });
};
