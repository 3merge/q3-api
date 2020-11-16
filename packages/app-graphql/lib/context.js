const mongoose = require('mongoose');
const httpController = require('q3-core-composer/lib/middleware');

module.exports = async ({ req }) =>
  new Promise((res) =>
    httpController(mongoose.models['q3-api-users'])(
      req,
      {},
      (err) =>
        err
          ? res({
              user: null,
            })
          : res({
              user: req.user,
            }),
    ),
  );
