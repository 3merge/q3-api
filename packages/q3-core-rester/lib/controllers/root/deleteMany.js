module.exports = async (
  { datasource, query: { ids }, t },
  res,
) => {
  await datasource.updateMany(
    {
      _id: { $in: ids },
    },
    { active: false },
  );
  res.acknowledge({
    message: t('messages:resourceDeleted'),
  });
};
