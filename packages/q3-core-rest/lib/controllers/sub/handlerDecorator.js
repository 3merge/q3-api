const { get, invoke, isFunction } = require('lodash');

module.exports = (Controller) => {
  const Forwarder = async (req, res) => {
    const {
      data,
      message,
      defaultResponseRouter = 'update',
    } = await Controller(req, res);

    const { fieldName, marshal, query } = req;

    const exec = (rest) =>
      isFunction(res[defaultResponseRouter])
        ? invoke(res, defaultResponseRouter, {
            message: res.say(message),
            ...rest,
          })
        : res.update({
            message: res.say(message),
            ...rest,
          });

    if (get(query, 'acknowledge')) {
      res.acknowledge();
    } else if (get(query, 'fullReceipt')) {
      exec({
        full: marshal(data),
      });
    } else {
      exec({
        [fieldName]: marshal(data[fieldName]),
      });
    }
  };

  // needs to forward props for q3-core-composer to work
  Object.keys(Controller).forEach((key) => {
    Forwarder[key] = Controller[key];
  });

  return Forwarder;
};
