const q3Socket = require('q3-api/lib/config/socket');
const io = require('socket.io-client');

module.exports = async () => {
  await q3Socket.listen();
  return io.connect('http://localhost:8080', {
    'force new connection': true,
    'reconnection delay': 0,
    'reopen delay': 0,
  });
};
