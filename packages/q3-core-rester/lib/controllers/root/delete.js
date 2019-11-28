module.exports = async ({ datasource, params, t }, res) => {
  await datasource.archive(params.resourceID);
  res.acknowledge({
    message: t('messages:resourceDeleted'),
  });
};
