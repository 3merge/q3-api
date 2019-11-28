module.exports = async (
  { t, body, marshal, fieldName, parent },
  res,
) => {
  await parent.set({ [fieldName]: body }).save();

  res.create({
    message: t('messages:newSubResourceAdded'),
    [fieldName]: marshal(parent[fieldName]),
  });
};
