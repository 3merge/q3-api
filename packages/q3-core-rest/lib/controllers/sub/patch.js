module.exports = async (
  { marshal, params, body, t, parent, fieldName },
  res,
) => {
  await parent.updateSubDocument(
    fieldName,
    params.fieldID,
    body,
  );

  res.update({
    message: t('messages:subResourceUpdated'),
    [fieldName]: marshal(parent[fieldName]),
  });
};
