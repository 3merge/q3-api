require('../helpers/lifecycle');
const { Student, Teacher } = require('../fixtures');

describe('bulk (query precision)', () => {
  it('should update only relevant', async () => {
    const teacher1 = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000064',
      {
        employment: [
          {
            references: [
              {
                ref: '601eab20fc13ae782c000001',
              },
              {
                ref: '601eab20fc13ae782c000002',
              },
            ],
          },
        ],
      },
    );

    const teacher2 = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a200006b',
      {
        employment: [
          {
            references: [
              {
                ref: '601eab20fc13ae782c000003',
              },
              {
                ref: '601eab20fc13ae782c000004',
              },
            ],
          },
        ],
      },
    );

    await teacher1.expectPathToHaveProperty(
      'employment.0.references.0.name',
      'Byrann Rigmond',
    );

    await teacher1.expectPathToHaveProperty(
      'employment.0.references.1.name',
      'Vin Beeston',
    );

    await teacher2.expectPathToHaveProperty(
      'employment.0.references.0.name',
      'Denni Figgs',
    );

    await Student.archive('601eab20fc13ae782c000001');
    await Student.findByIdAndModify(
      '601eab20fc13ae782c000003',
      {
        name: 'Robert Mary',
      },
    );

    const updated = await teacher1.expectPathToHaveProperty(
      'employment.0.references.0.name',
      'Vin Beeston',
    );

    expect(updated.employment[0].references).toHaveLength(
      1,
    );

    await teacher2.expectPathToHaveProperty(
      'employment.0.references.0.name',
      'Robert Mary',
    );

    await teacher2.expectPathToHaveProperty(
      'employment.0.references.1.name',
      'Gerhardine Matfin',
    );
  });
});
