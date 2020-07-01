module.exports = (Q3InsanceConfig, executable) => {
  const connection = Q3InsanceConfig.connect();

  process.on('close', () => {
    connection.close();
  });

  process.on('message', (args) => {
    // eslint-disable-next-line
    require('dotenv').config();

    return connection
      .then(() => executable(args))
      .then((resp) => process.send(resp));
  });
};
