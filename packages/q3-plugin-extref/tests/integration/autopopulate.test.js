require('../helpers/lifecycle');
const mongoose = require('mongoose');
const { Student, Teacher, School } = require('../fixtures');

describe('remove', () => {
  it('should set', async () => {
    const teacherId = '601eab32fc13ae12a200006c';
    const student = await Student.findByIdAndModify(
      '601eab20fc13ae782c000001',
      {
        'teacher': mongoose.Types.ObjectId(teacherId),
      },
    );

    await student.expectPathToHaveProperty(
      'teacher.name',
      'Art Anstis',
    );
  });

  it('should replace', async () => {
    const name = 'Guy';
    const teacherId = '601eab32fc13ae12a200006d';
    const student = await Student.findByIdAndModify(
      '601eab20fc13ae782c000001',
      {
        'teacher': mongoose.Types.ObjectId(teacherId),
      },
    );

    await Teacher.findByIdAndModify(teacherId, {
      name,
    });

    await student.expectPathToHaveProperty(
      'teacher.name',
      name,
    );
  });

  it('should remove', async () => {
    const teacherId = '601eab32fc13ae12a2000064';
    const student = await Student.findByIdAndModify(
      '601eab20fc13ae782c000001',
      {
        'teacher': mongoose.Types.ObjectId(teacherId),
      },
    );

    await Teacher.archive(teacherId);
    await student.expectPathToHaveProperty(
      'teacher',
      undefined,
    );
  });

  it('should remove nested', async () => {
    const studentId = '601eab20fc13ae782c000000';
    const student = await School.findByIdAndModify(
      '601eaab4fc13ae1226000008',
      {
        'honourRoll': [
          {
            student: mongoose.Types.ObjectId(studentId),
          },
        ],
      },
    );

    await student.expectPathToHaveProperty(
      'honourRoll.0.student.name',
      'Delmore Bavidge',
    );

    await Student.archive(studentId);
    await student.expectPathNotToHaveProperty(
      'honourRoll.0',
    );
  });
});
