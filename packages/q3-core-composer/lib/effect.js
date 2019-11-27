/** DEPRECATE THIS */

module.exports = (callbacks) =>
  callbacks
    ? [
        (req, res, next) => {
          let counter = 0;
          req.evoke = (i) => {
            callbacks[counter](i, req);
            counter += 1;
          };

          next();
        },
      ]
    : [];
