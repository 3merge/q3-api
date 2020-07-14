const q3Socket = require('q3-api/lib/config/socket');
const io = require('socket.io-client');

module.exports = async (apikey) => {
  await q3Socket.listen();
  return io.connect(
    // remove ApiKey prefix from auth string
    `http://localhost:8080?apikey=${apikey.substr(7)}`,
    {
      'reconnection delay': 0,
      'reopen delay': 0,
    },
  );
};
