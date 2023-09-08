module.exports = function getMaxFileSize() {
  const defaultValue = 50 * 1024 * 1024;
  const applicationValue = process.env.Q3_MAX_FILE_SIZE;

  return /^[0-9]*$/.test(applicationValue) &&
    applicationValue
    ? Number(applicationValue)
    : defaultValue;
};
