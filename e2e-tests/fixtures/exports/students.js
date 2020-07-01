require('dotenv').config();

const { execChildProcess } = require('q3-api/lib/helpers');
const Q3Instance = require('../config');
const { Student } = require('../models');

execChildProcess(Q3Instance, async ({ user, ids }) => {
  const fileName = 'testing.xlsx';
  const students = await Student.find({})
    .select('name')
    .lean()
    .exec();

  return Q3Instance.Reports.uploadAndReturnRecent(
    fileName,
    students,
    user,
  );
});
