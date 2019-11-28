module.exports = async (
  { parent, fieldName, query: { ids } },
  res,
) => {
  await parent.removeSubDocument(fieldName, ids);
  res.acknowledge();
};
