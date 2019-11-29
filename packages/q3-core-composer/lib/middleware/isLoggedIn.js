module.exports = ({ user }, res, next) =>
  !user ? res.status(401).send() : next();
