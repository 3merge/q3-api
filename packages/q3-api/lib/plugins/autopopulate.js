const { model } = require('mongoose');

const pushUniquely = (a, i) =>
  a.indexOf(i) === -1 && a.push(i);

const setPrefix = (p, name) =>
  `${typeof p === 'string' ? `${p}.` : ''}${name}`;

module.exports = (schema) => {
  const paths = [];

  const getPaths = (s, p) =>
    s.eachPath(
      (pathname, { options, schema: embedded }) => {
        if (embedded) getPaths(embedded, pathname);
        if (options.autopopulate)
          pushUniquely(paths, {
            path: setPrefix(p, pathname),
            model: model(options.ref),
            select: options.autopopulateSelect,
            options: { bypassAuthorization: true },
          });
      },
    );

  async function autopopulate(doc) {
    if (!doc || !doc.populate) return;
    getPaths(schema);

    if (schema.discriminators)
      Object.values(schema.discriminators).forEach(
        getPaths,
      );

    await Promise.all(
      paths
        .flat()
        .map((o) =>
          !('parent' in this)
            ? doc.populate(o).execPopulate()
            : null,
        ),
    );
  }

  schema
    .post('find', autopopulate)
    .post('findOne', autopopulate)
    .post('findOneAndUpdate', autopopulate)
    .post('save', autopopulate);
};
