require('../helpers/lifecycle');
const {
  Award,
  School,
  Student,
  Teacher,
} = require('../fixtures');

describe('remove', () => {
  it('should unset (single simple)', async () => {
    const schoolId = '601eaab4fc13ae1226000008';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a200006c',
      {
        'school.ref': schoolId,
      },
    );

    await School.archive(schoolId);
    await teacher.expectPathNotToHaveProperty(
      'school.name',
    );
  });

  it('should unset (nested simple)', async () => {
    const schoolId = '601eaab4fc13ae1226000001';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000065',
      {
        employment: [{ 'school.ref': schoolId }],
      },
    );

    await School.archive(schoolId);
    await teacher.expectPathNotToHaveProperty(
      'employment.0.school.name',
    );
  });

  it('should pull (nested embedded)', async () => {
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

    await Student.archive(studentId);
    await teacher.expectPathNotToHaveProperty(
      'employment.0.references.0.name',
    );
  });

  it('should unset (nested complex embedded)', async () => {
    const teacherId = '601eab32fc13ae12a2000064';
    const teacher = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000064',
      {
        employment: [
          {
            awards: [
              {
                presentedBy: {
                  ref: teacherId,
                },
              },
            ],
          },
        ],
      },
    );

    await Teacher.archive(teacherId);
    await teacher.expectPathNotToHaveProperty(
      'employment.0.awards.0.award.presentedBy',
    );
  });

  it('should pull required (nested complex embedded)', async () => {
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

    await Award.archive(awardId);
    await teacher.expectPathNotToHaveProperty(
      'employment.0.awards.0',
    );
  });
});
