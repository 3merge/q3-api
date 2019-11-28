module.exports = async (
  { parent, fieldName, params },
  res,
) => {
  await parent.removeSubDocument(fieldName, params.fieldID);
  res.acknowledge();
};
