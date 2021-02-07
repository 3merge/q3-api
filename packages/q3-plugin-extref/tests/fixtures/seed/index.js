const awards = require('./awards.json');
const schools = require('./schools.json');
const students = require('./students.json');
const teachers = require('./teachers.json');

module.exports = (name) => {
  const data = {
    awards,
    schools,
    students,
    teachers,
  }[name];

  return data;
};
