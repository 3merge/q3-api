const { get, compact, join } = require('lodash');
const SchemaIterator = require('./schemaIterator');

const POSITIONAL_OP = '$[]';

const concatenate = (...a) => join(compact(a), '');

const getPathKeys = (schema) => Object.keys(schema.paths);

const getChildSchemaPath = (childSchema) =>
  get(childSchema, 'model.path');

const hasRequiredRefPath = (childSchema) =>
  get(childSchema, 'schema.paths.ref.options.required');

const hasSchemaOption = (childSchema, option) =>
  Boolean(get(childSchema, `schema.options.${option}`));

const makeEmbeddedWorkingPath = (
  workingPath,
  childSchema,
) =>
  concatenate(
    workingPath ? `${workingPath}.` : '',
    getChildSchemaPath(childSchema),
    `.${POSITIONAL_OP}`,
  );

const makeRequiredWorkingPath = (
  workingPath,
  childSchema,
) =>
  hasSchemaOption(childSchema, 'required') ||
  hasRequiredRefPath(childSchema)
    ? `${workingPath}!`
    : workingPath;

const recurseModel = (fn) => (model) =>
  fn(get(model, 'schema'));

exports.assembleSyncSchemaPaths = recurseModel(
  function self(sch, workingPath = '') {
    const addToOutput = (schema, path = '') => ({
      [makeRequiredWorkingPath(
        concatenate(workingPath, path),
        { schema },
      )]: getPathKeys(schema),
    });

    return SchemaIterator(sch, 'sync', {})
      .init(addToOutput)
      .forEachEmbeddedPath((c) =>
        self(
          c.schema,
          makeEmbeddedWorkingPath(workingPath, c),
        ),
      )
      .forEachSimpleDocument((c) =>
        addToOutput(c.schema, getChildSchemaPath(c)),
      )
      .end();
  },
);

exports.assembleAutocompleteSchemaPaths = recurseModel(
  function self(sch, workingPath = '') {
    return SchemaIterator(sch, 'autopopulate', [])
      .forEachPath((pathname, schema) =>
        makeRequiredWorkingPath(
          concatenate(workingPath, pathname),
          {
            schema,
          },
        ),
      )
      .forEachEmbeddedPath((c) =>
        self(
          c.schema,
          makeEmbeddedWorkingPath(workingPath, c),
        ),
      )
      .forEachSimpleDocument((c) =>
        makeRequiredWorkingPath(
          concatenate(workingPath, c.model.path),
          c,
        ),
      )
      .end();
  },
);
