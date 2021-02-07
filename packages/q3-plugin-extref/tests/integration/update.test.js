require('../helpers/lifecycle');
const {
  Award,
  School,
  Student,
  Teacher,
} = require('../fixtures');

describe('update', () => {
  it('should populate (single simple)', async () => {
    const name = 'Eulogia Academy';
    const schoolId = '601eaab4fc13ae1226000008';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a200006c',
      {
        'school.ref': schoolId,
      },
    );

    await School.findByIdAndModify(schoolId, {
      name,
    });

    await teacher.expectPathToHaveProperty(
      'school.name',
      name,
    );
  });

  it('should populate (nested simple)', async () => {
    const name = 'Eastwood High';
    const schoolId = '601eaab4fc13ae1226000001';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000065',
      {
        employment: [{ 'school.ref': schoolId }],
      },
    );

    await School.findByIdAndModify(schoolId, {
      name,
    });

    await teacher.expectPathToHaveProperty(
      'employment.0.school.name',
      name,
    );
  });

  it('should populate (nested embedded)', async () => {
    const name = 'James Roy';
    const studentId = '601eab20fc13ae782c000004';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000064',
      {
        employment: [
          {
            references: [
              {
                ref: studentId,
              },
            ],
          },
        ],
      },
    );

    await Student.findByIdAndModify(studentId, {
      name,
    });

    await teacher.expectPathToHaveProperty(
      'employment.0.references.0.name',
      name,
    );
  });

  it('should populate (nested complex embedded)', async () => {
    const name = 'Teacher of the Year';
    const awardId = '601ffd5afc13ae6eae000003';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000064',
      {
        employment: [
          {
            awards: [
              {
                award: {
                  ref: awardId,
                },
              },
            ],
          },
        ],
      },
    );

    await Award.findByIdAndModify(awardId, {
      name,
    });

    await teacher.expectPathToHaveProperty(
      'employment.0.awards.0.award.name',
      name,
    );
  });
});
