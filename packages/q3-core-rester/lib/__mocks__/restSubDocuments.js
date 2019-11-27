const Router = require('express')
;
module.exports = jest.fn().mockImplementation(() => {
  return Router();
});
