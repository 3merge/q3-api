const { compose, verify } = require('q3-core-composer');
const { fork } = require('child_process');
const path = require('path');
const app = require('../../config/express');
const { sse } = require('../../helpers');

const GetExports = async (req, res, next) => {
  const dispatch = sse(req, res);
  const {
    query: { collectionName, ids },
  } = req;
  const { location } = app.locals;
  const forked = fork(
    path.join(location, 'exports', collectionName),
  );

  forked.on('message', (data) =>
    dispatch({
      eventName: 'download',
      id: 1,
      data,
    }),
  );

  // send a list of ids (assumed to be active)
  // or select only the active data
  forked.send({
    user: req.user,
    ids,
  });

  next();
};

// GetExports.authorization = [verify];

module.exports = compose(GetExports);
