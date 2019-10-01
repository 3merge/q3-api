const getSignedUrl = jest.fn();

module.exports = {
  getSignedUrl,
  S3: jest.fn().mockImplementation(() => ({
    getSignedUrl,
  })),
};
