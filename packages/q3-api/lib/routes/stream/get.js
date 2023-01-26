const { compose } = require('q3-core-composer');
const { Grant } = require('q3-core-access');
const { isNil } = require('lodash');
const { Users } = require('../../models');

const Stream = async (req, res) => {
  const { userId } = req.query;
  const user = await Users.findById(userId);

  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.flushHeaders();
  res.status(200);

  const str = req.app.get('changestream');

  const canSee = (args = {}) => {
    const { collection, userId: id } = args;
    const open = [
      'notifications',
      'system-counters',
    ].includes(collection);

    return open
      ? String(id) === userId
      : !isNil(
          new Grant(user)
            .can('Read')
            .on(collection)
            .first(),
        );
  };

  const broadcast = (type, data = {}) => {
    res.write(`type: ${type}\n`);

    if (canSee(data)) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    res.flush();
  };

  const interval = setInterval(() => {
    broadcast('ping');
  }, 45000);

  const handleRefresh = (data) => {
    broadcast('refresh', data);
  };

  const cancel = () => {
    if (interval) clearInterval(interval);
    str.onLeave(handleRefresh);
    res.end();
  };

  str.onRefresh(handleRefresh);
  req.on('close', cancel);
};

module.exports = compose(Stream);
