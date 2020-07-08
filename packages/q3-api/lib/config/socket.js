// eslint-disable-next-line
const http = require('http').Server(require('./express'));
const io = require('socket.io')(http);
const { get } = require('lodash');
const mongoose = require('./mongoose');

io.on('connection', () => {
  // send initial notifications?
  // noop
});

io.listen = () => {
  // the socket will always be 8080 in our applications
  // the main app port may change, though, between dev and production
  http.listen(8080);

  return Object.values(mongoose.models).forEach((Model) =>
    Model.watch()
      .on(
        'change',
        ({
          operationType,
          documentKey: { _id },
          ns: { coll },
          ...rest
        }) => {
          io.emit(operationType, {
            updatedAt: get(
              rest,
              // this will always change so long as timestamps is enabled
              'updateDescription.updatedFields.updatedAt',
              new Date(),
            ),
            collectionName: coll,
            id: _id,
          });
        },
      )
      .on('error', () => {
        // boll
      }),
  );
};

module.exports = io;
