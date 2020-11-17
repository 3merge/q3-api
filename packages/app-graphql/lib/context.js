const mongoose = require('mongoose');
const httpController = require('q3-core-composer/lib/middleware');

module.exports = async ({ req }) => {
  return new Promise((res) =>
    httpController(mongoose.models['q3-api-users'])(
      req,
      {},
      (err) =>
        err
          ? res({
              user: null,
              t: req.t,
            })
          : res({
              user: req.user,
              t: req.t,
            }),
    ),
  );
};
