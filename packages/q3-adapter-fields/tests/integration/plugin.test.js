const Model = require('../fixtures');

test.each([
  {
    field: 'title',
    definitions: {
      name: 'title',
      required: true,
      type: 'text',
    },
  },
  {
    field: 'description',
    definitions: {
      name: 'description',
      type: 'text',
      required: false,
      multiline: true,
      rows: 5,
    },
  },
  {
    field: 'age',
    definitions: {
      name: 'age',
      type: 'number',
      min: 18,
      required: false,
    },
  },
  {
    field: 'pronoun',
    definitions: {
      name: 'pronoun',
      type: 'select',
      options: ['Mr', 'Mrs', 'Ms'],
      required: false,
    },
  },
  {
    field: 'friend',
    definitions: {
      name: 'friend',
      type: 'autocomplete',
      required: true,
      model: 'references',
    },
  },
])(
  '.getFieldDesignInstructions(%s)',
  ({ field, definitions }) =>
    expect(Model.getFieldDesignInstructions(field)).toEqual(
      definitions,
    ),
);
