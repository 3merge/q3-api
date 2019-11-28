module.exports = async (
  { subdocs, fieldName, marshal },
  res,
) =>
  res.ok({
    [fieldName]: marshal(subdocs),
  });
