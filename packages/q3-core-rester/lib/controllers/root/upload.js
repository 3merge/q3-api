module.exports = async (
  { datasource, params, files },
  res,
) => {
  const doc = await datasource.findStrictly(
    params.resourceID,
  );
  if (
    files &&
    Object.keys(files).length &&
    doc.handleFeaturedUpload
  ) {
    await doc.handleFeaturedUpload({ files });
  }

  res.acknowledge();
};
