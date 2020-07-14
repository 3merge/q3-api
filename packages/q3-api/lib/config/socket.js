// eslint-disable-next-line
const http = require('http').Server(require('./express'));
const io = require('socket.io')(http);
const { get } = require('lodash');
const mongoose = require('./mongoose');

// middleware
io.use(async (socket, next) => {
  const {
    handshake: { headers, query },
  } = socket;
  const { host } = headers;
  const { nonce, token, apikey } = query;

  if (token)
    // eslint-disable-next-line
    socket.user = await mongoose.models[
      'q3-api-users'
    ].findbyBearerToken(token, nonce, host);
  else if (apikey)
    // eslint-disable-next-line
    socket.user = await mongoose.models[
      'q3-api-users'
    ].findByApiKey(apikey, host);

  return next(
    !socket.user
      ? // never allow public connects to socket
        new Error('Authentication error')
      : undefined,
  );
});

io.on('connection', async (socket) => {
  const Noti = mongoose.models['q3-api-notifications'];

  io.emit('message', {
    data: await Noti.recent(socket.user),
  });

  socket.on('acknowledge', async (id, ack) => {
    await Noti.acknowledge(id);
    ack();
  });
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
