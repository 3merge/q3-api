const ExportToText = async (body = []) => {
  try {
    return Buffer.from(body.join(''), 'utf8');
  } catch (e) {
    return null;
  }
};

module.exports = ExportToText;
