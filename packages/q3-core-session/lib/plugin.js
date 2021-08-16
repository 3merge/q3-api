const { getAll } = require('.');

module.exports = (s) => {
  const copyToContext = function markPrivateContext() {
    this.__$q3 = getAll();
  };

  const copyToInstance = () => ({
    __$q3: getAll(),
  });

  // eslint-disable-next-line
  s.statics.getSessionVariables = copyToInstance;

  // eslint-disable-next-line
  s.methods.getSessionVariables = copyToInstance;

  s.pre('find', copyToContext);
  s.pre('findOne', copyToContext);
  s.pre('findById', copyToContext);
  s.pre('count', copyToContext);
  s.pre('countDocuments', copyToContext);
  s.pre('distinct', copyToContext);
  s.pre('save', copyToContext);
  return s;
};
