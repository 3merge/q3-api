require('dotenv').config();

const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../../config');
const { Student } = require('../../models');

const pipeline = () => {
  return [];
};

execChildProcess(
  Q3Instance,
  async ({ user, filter, redact }) => {
    const fileName = 'testing.xlsx';

    const students = await Student.find(filter)
      .select('name')
      .lean()
      .exec();

    const data = await redact(students, 'students');

    // send file back to server
    return Q3Instance.Notifications.upload(
      { name: fileName, data, user },
      {
        name: 'labels:demo',
      },
    );
  },
);

module.exports = pipeline;
