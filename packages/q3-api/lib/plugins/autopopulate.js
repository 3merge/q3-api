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
          pushUniquely(paths, setPrefix(p, pathname));
      },
    );

  function autopopulate() {
    getPaths(schema);
    if (schema.discriminators)
      Object.values(schema.discriminators).forEach(
        getPaths,
      );

    paths.flat().forEach((p) => {
      this.populate(p);
    });
  }

  schema
    .pre('find', autopopulate)
    .pre('findOne', autopopulate)
    .pre('findOneAndUpdate', autopopulate);
};
