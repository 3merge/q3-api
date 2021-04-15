const {
  get,
  invoke,
  isFunction,
  isString,
} = require('lodash');

module.exports = (Controller) => {
  const Forwarder = async (req, res) => {
    const {
      data,
      message,
      defaultResponseRouter = 'update',
    } = await Controller(req, res);

    const { fieldName, marshal, query } = req;

    const withMessage = (args) =>
      isString(message) && isFunction(res.say)
        ? {
            message: res.say(message),
            ...args,
          }
        : args;

    const exec = (rest) =>
      isFunction(res[defaultResponseRouter])
        ? invoke(
            res,
            defaultResponseRouter,
            withMessage(rest),
          )
        : res.update(withMessage(rest));

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
