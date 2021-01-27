const Q3 = require('q3-api');
const Character = require('../models/character');

const genDoc = ({ name }) => ({
  content: [`Character name: ${name}`],
  styles: {},
  defaultStyle: {},
  footer(currentPage, pageCount) {
    return [`${currentPage.toString()} of ${pageCount}`];
  },
});

module.exports = async ({ query }) => {
  const characters = await Character.find(query)
    .select('name')
    .lean()
    .exec();

  await Q3.saveToSessionDownloads('characters.pdf', {
    data: characters.map((c) => genDoc(c)),
  });
};
