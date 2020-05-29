const getFromCorsWhiteList = (origin) => {
  const { WHITELIST_CORS: whitelist } = process.env;

  return typeof whitelist === 'string' &&
    whitelist !== 'null' &&
    whitelist !== 'undefined'
    ? whitelist.split(',').indexOf(origin) !== -1
    : true;
};

module.exports = ({ locals }) => ({
  credentials: true,

  async origin(origin, callback) {
    const { onCors, enableServerToServer } = locals || {};
    const includes = getFromCorsWhiteList(origin);

    try {
      let bypass;

      if (!includes && onCors) {
        // throw an error to block the process
        // otherwise, we assume business as usual
        await onCors(origin);
        bypass = true;
      }

      if (
        includes ||
        (!origin && enableServerToServer) ||
        bypass
      ) {
        callback(null, true);
      } else {
        throw new Error('Not allowed by CORS');
      }
    } catch (e) {
      callback(e);
    }
  },
});
