// eslint-disable-next-line
const http = require('http').Server(require('./express'));
const io = require('socket.io')(http);
const { get } = require('lodash');
const mongoose = require('./mongoose');

class CollectionWatch {
  constructor(socket) {
    this.$socket = socket;
  }

  static getUpdatedProp(params) {
    return get(
      params,
      // this will always change so long as timestamps is enabled
      'updateDescription.updatedFields.updatedAt',
      new Date(),
    );
  }

  watch(models = {}) {
    Object.values(models).forEach((Model) => {
      const coll = get(
        Model,
        'collection.collectionName',
        'noop',
      );

      const emitTo = (args) =>
        this.$socket
          .to(coll)
          .emit(
            'refresh',
            this.constructor.getUpdatedProp(args),
          );

      if (
        ![
          'q3-api-notifications',
          'q3-task-scheduler-logs',
          'q3-task-schedulers',
        ].includes(coll)
      )
        Model.watch()
          .on('change', (args) => {
            emitTo(args);
          })
          .on('error', () => {
            // do not emit on error
          });
    });
  }
}

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

  const makeRoom = ({ collectionName, id }) =>
    [collectionName, id]
      .filter(Boolean)
      .join('.')
      .replace(/\.$/, '');

  socket.on('join', (data) => {
    socket.join(makeRoom(data));
  });

  socket.on('leave', (data) => {
    socket.leave(makeRoom(data));
  });

  socket.on('change', ({ updatedAt, ...data }) => {
    socket.to(makeRoom(data)).emit('modify', updatedAt);
  });

  socket.on('disconnect', () => {
    Object.values(io.sockets.rooms).forEach((room) => {
      socket.leave(room);
    });
  });

  socket.emit('recent', {
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
  new CollectionWatch(io).watch(mongoose.models);
};

module.exports = io;
