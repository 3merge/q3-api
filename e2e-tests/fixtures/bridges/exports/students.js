require('dotenv').config();

const { execChildProcess } = require('q3-api/lib/helpers');
const { Redact } = require('q3-core-access');
const Q3Instance = require('../../config');
const { Student } = require('../../models');

execChildProcess(
  Q3Instance,
  async ({ user, query }, trans) => {
    const fileName = 'testing.xlsx';

    const students = await Student.find(query)
      .select('name')
      .lean()
      .exec();

    const data = await Redact(students, user, 'students');
    const mapped = Q3Instance.Reports.mapHeaders(
      data,
      {
        name: 'labels:demo',
      },
      trans,
    );

    // send file back to server
    return Q3Instance.Reports.uploadAndReturn(
      fileName,
      mapped,
      user,
    );
  },
);
