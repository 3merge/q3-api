module.exports = (req, res) => {
  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);

  res.sse = function sse(string) {
    res.write(string);

    // support running within the compression middleware
    if (res.flush && string.match(/\n\n$/)) {
      res.flush();
    }
  };

  const keepAlive = setInterval(
    () => res.sse(':keep-alive\n\n'),
    2000,
  );

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.status(200);

  // write 2kB of padding (for IE) and a reconnection timeout
  // then use res.sse to send to the client
  res.write(`:${Array(2049).join(' ')}\n`);
  res.sse('retry: 2000\n\n');

  // cleanup on close
  res.on('close', () => clearInterval(keepAlive));

  return ({ id, eventName, data = {} }) => {
    res.write(`id: ${id}\n`);
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
};
