module.exports = async (
  { t, body, marshal, files, parent, fieldName },
  res,
) => {
  if (!files) {
    await parent.pushSubDocument(this.field, body);
  } else {
    await parent.handleUpload({ files, ...body });
  }

  res.create({
    message: t('messages:newSubResourceAdded'),
    [fieldName]: marshal(parent[fieldName]),
  });
};
