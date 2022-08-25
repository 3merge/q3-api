const fs = require('fs');

const ensureExistenceOf = (dr) => {
  if (!fs.existsSync(dr))
    fs.mkdirSync(dr, {
      recursive: true,
    });
};

const writeJsonTo = (filePath, json) =>
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2));

const checkExistenceOfAndWriteJsonTo = (filePath, json) => {
  if (!fs.existsSync(filePath)) {
    writeJsonTo(filePath, json);
  }
};

module.exports = {
  ensureExistenceOf,
  writeJsonTo,
  checkExistenceOfAndWriteJsonTo,
};
