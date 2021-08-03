const { exception } = require('q3-core-responder');
const { isSimpleSubDocument } = require('../../utils');

module.exports =
  (fn) =>
  (...params) => {
    const [req] = params;
    const { parent, fieldName } = req;

    if (isSimpleSubDocument(parent, fieldName))
      exception('Conflict').msg('usePutRequest').throw();

    return fn(...params);
  };
