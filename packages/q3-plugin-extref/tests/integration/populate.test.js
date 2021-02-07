require('../helpers/lifecycle');
const { Teacher } = require('../fixtures');

describe('populate', () => {
  it('should populate (single simple)', async () => {
    const doc = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a2000065',
      { 'school.ref': '601eaab4fc13ae1226000000' },
    );

    expect(doc).toHaveProperty(
      'school.name',
      'Delaware State University',
    );
  });

  it('should populate (nested simple)', async () => {
    const doc = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a200006d',
      {
        employment: [
          {
            'school.ref': '601eaab4fc13ae1226000009',
            year: new Date('1990-01-01'),
          },
        ],
      },
    );

    expect(doc).toHaveProperty(
      'employment.0.school.name',
      'Institut National des Sciences Appliquées de Rennes',
    );
  });

  it('should populate (nested embedded)', async () => {
    const doc = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a200006b',
      {
        employment: [
          {
            references: [
              {
                ref: '601eab20fc13ae782c000002',
              },
            ],
          },
        ],
      },
    );

    expect(doc).toHaveProperty(
      'employment.0.references.0.name',
      'Vin Beeston',
    );
  });

  it('should populate (nested complex embedded)', async () => {
    const doc = await Teacher.findByIdAndModify(
      '601eab32fc13ae12a200006d',
      {
        employment: [
          {
            awards: [
              {
                award: {
                  ref: '601ffd5afc13ae6eae000004',
                },
              },
            ],
          },
        ],
      },
    );

    expect(doc).toHaveProperty(
      'employment.0.awards.0.award.name',
      'augue luctus',
    );
  });
});
