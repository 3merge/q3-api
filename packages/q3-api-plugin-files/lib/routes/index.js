// allows express-validator to read it
// necessary for RBAC plugin to work, too
module.exports = (req, res, next) => {
  Object.assign(req.body, {
    files: req.files,
  });

  next();
};
