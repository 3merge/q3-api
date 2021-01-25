const { compose } = require('q3-core-composer');

const Stream = (req, res) => {
  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.status(200);
  res.write(':keep-alive\n\n');
  res.flush();

  res.on('close', () => {
    res.end();
  });

  try {
    req.app.get('changestream').onRefresh((data) => {
      res.write('type: refresh\n');
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      res.flush();
    });
  } catch (e) {
    res.end();
  }
};

module.exports = compose(Stream);
