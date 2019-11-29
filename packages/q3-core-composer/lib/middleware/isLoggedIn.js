module.exports = ({ user, grant }, res, next) => {
  if (!user && (!grant || grant.role !== 'Public')) {
    return res.status(401).send();
  }

  return next();
};
