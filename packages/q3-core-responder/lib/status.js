const statusCodeHelper =
  (res) =>
  (code) =>
  (body = {}) => {
    res.status(code).json(body);
  };

const removeEmpty = (obj = {}) =>
  Object.entries(obj).reduce((a, [key, value]) => {
    const copy = { ...a };
    if (value !== null && value !== undefined)
      copy[key] = value;
    return copy;
  }, {});

const stripMongoDBProps = (i) => {
  try {
    if (typeof i !== 'object') return i;

    const json = JSON.parse(JSON.stringify(i));
    const cleaned = removeEmpty(json);

    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.password;
    delete cleaned.secret;

    return Object.entries(cleaned).reduce(
      (a, [k, v]) =>
        Object.assign(a, {
          [k]: Array.isArray(v)
            ? v.map(stripMongoDBProps)
            : stripMongoDBProps(v),
        }),
      cleaned,
    );
  } catch (e) {
    return JSON.parse(JSON.stringify(i));
  }
};

const decorateResponse = (req, res, next) => {
  const dispatch = statusCodeHelper(res);

  req.marshal = (o) => {
    if (Array.isArray(o)) {
      return o.map(stripMongoDBProps);
    }

    return stripMongoDBProps(o);
  };

  res.acknowledge = dispatch(204);
  res.ok = dispatch(200);
  res.update = dispatch(200);
  res.create = dispatch(201);
  next();
};

module.exports = decorateResponse;
