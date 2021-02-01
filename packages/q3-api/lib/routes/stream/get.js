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

  const interval = setInterval(() => {
    res.write(':\n');
  }, 45000);

  const cancel = () => {
    if (interval) clearInterval(interval);
    res.end();
  };

  res.on('close', cancel);

  try {
    req.app.get('changestream').onRefresh((data) => {
      res.write('type: refresh\n');
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      res.flush();
    });
  } catch (e) {
    cancel();
  }
};

module.exports = compose(Stream);
