const { get, size } = require('lodash');

module.exports = ({ instance, enumValues, schema }) => {
  if (size(enumValues)) return 'select';

  if (instance === 'Embedded' && get(schema, 'paths.ref'))
    return 'autocomplete';

  return (
    {
      String: 'text',
      Number: 'number',
    }[instance] || 'text'
  );
};
