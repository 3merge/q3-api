const { compose } = require('q3-core-composer');

const Stream = (req, res) => {
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

  const broadcast = (type, data = {}) => {
    res.write(`type: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
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
