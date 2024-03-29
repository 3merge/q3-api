const awards = require('./awards.json');
const schools = require('./schools.json');
const colleges = require('./colleges.json');
const students = require('./students.json');
const teachers = require('./teachers.json');

module.exports = (name) => {
  const data = {
    awards,
    colleges,
    schools,
    students,
    teachers,
  }[name];

  return data;
};
