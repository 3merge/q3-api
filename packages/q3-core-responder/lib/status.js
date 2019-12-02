const etag = require('etag');
const moment = require('moment');

const statusCodeHelper = (res) => (code) => (body = {}) => {
  res.set('ETag', etag(JSON.stringify(body)));
  res.status(code).json(body);
};

const removeEmpty = (obj = {}) =>
  Object.entries(obj).reduce((a, [key, value]) => {
    const copy = { ...a };
    if (value) copy[key] = value;
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

  req.marshal = (o) =>
    Array.isArray(o)
      ? o.map(stripMongoDBProps)
      : stripMongoDBProps(o);

  req.isFresh = (d) => {
    const unmod = req.headers['if-unmodified-since'];
    return unmod &&
      moment(unmod).isValid() &&
      moment(d).isValid() &&
      moment(d).isAfter(new Date(unmod).toISOString())
      ? res.status(412).send()
      : true;
  };

  res.acknowledge = dispatch(204);
  res.ok = dispatch(200);
  res.update = dispatch(200);
  res.create = dispatch(201);
  next();
};

module.exports = decorateResponse;