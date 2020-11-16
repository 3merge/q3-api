exports.convertM2eToGraphqlSchemaTypeDef = (
  attributes = {},
  options = {},
) => {
  let v = 'String';

  if (attributes.toFloat) v = 'Float';
  if (attributes.toDate) v = 'Date';
  if (
    attributes?.isEmpty?.checkFalsy &&
    !options?.disableRequirements
  )
    v += '!';

  return v;
};
