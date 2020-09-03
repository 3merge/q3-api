require('dotenv').config();

const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');
const { Character } = require('../../models');

const genDoc = ({ name }) => ({
  content: [`Character name: ${name}`],
  styles: {},
  defaultStyle: {},
  footer(currentPage, pageCount) {
    return [`${currentPage.toString()} of ${pageCount}`];
  },
});

execChildProcess(
  Q3Instance,
  async ({ user, filter: { ids } }) => {
    const fileName = 'characters.pdf';

    const characters = await Character.find({ _id: ids })
      .select('name')
      .lean()
      .exec();

    const file = await Q3Instance.Notifications.upload({
      name: fileName,
      data: characters.map((c) => genDoc(c)),
      user,
    });

    return file;
  },
);
