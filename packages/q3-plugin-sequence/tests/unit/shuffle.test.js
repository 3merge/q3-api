const shuffleOriginal = require('../../lib/shuffle');

const shuffle = (a) =>
  shuffleOriginal(a).map((item) => {
    // eslint-disable-next-line
    delete item.$locals;
    // eslint-disable-next-line
    delete item.isModified;
    return item;
  });

describe('shuffle', () => {
  it('should assign undefined', () => {
    expect(
      shuffle([
        {
          id: 1,
          seq: undefined,
          type: 'Note',
        },
        {
          id: 2,
          seq: 1,
          type: 'Note',
        },
      ]),
    ).toEqual([
      {
        id: 1,
        seq: 2,
        type: 'Note',
      },
      {
        id: 2,
        seq: 1,
        type: 'Note',
      },
    ]);
  });

  it('should reorder on change', () => {
    expect(
      shuffle([
        {
          id: 1,
          seq: 1,
          type: 'Note',
          updatedAt: '2021-11-11T19:29:02.073Z',
        },
        {
          id: 2,
          seq: 1,
          type: 'Note',
          updatedAt: '2021-11-11T19:31:02.073Z',
        },
        {
          id: 3,
          seq: 2,
          type: 'Note',
        },
        {
          id: 4,
          seq: 1,
          type: 'Instruction',
          updatedAt: '2021-11-11T19:29:02.073Z',
        },
        {
          id: 5,
          seq: 2,
          type: 'Instruction',
        },
        {
          id: 6,
          seq: 1,
          type: 'Instruction',
          updatedAt: '2021-11-11T19:31:02.073Z',
        },
      ]),
    ).toEqual([
      {
        id: 1,
        seq: 2,
        type: 'Note',
        updatedAt: '2021-11-11T19:29:02.073Z',
      },
      {
        id: 2,
        seq: 1,
        type: 'Note',
        updatedAt: '2021-11-11T19:31:02.073Z',
      },
      {
        id: 3,
        seq: 3,
        type: 'Note',
      },
      {
        id: 4,
        seq: 2,
        type: 'Instruction',
        updatedAt: '2021-11-11T19:29:02.073Z',
      },
      {
        id: 5,
        seq: 3,
        type: 'Instruction',
      },
      {
        id: 6,
        seq: 1,
        type: 'Instruction',
        updatedAt: '2021-11-11T19:31:02.073Z',
      },
    ]);
  });

  it('should collapse gaps', () => {
    expect(
      shuffle([
        {
          id: 1,
          seq: 1,
          type: 'Instruction',
        },
        {
          id: 2,
          seq: 3,
          type: 'Instruction',
        },
        {
          id: 3,
          seq: 3,
          type: 'Instruction',
        },
      ]),
    ).toEqual([
      {
        id: 1,
        seq: 1,
        type: 'Instruction',
      },
      {
        id: 2,
        seq: 2,
        type: 'Instruction',
      },
      {
        id: 3,
        seq: 3,
        type: 'Instruction',
      },
    ]);
  });

  it('should reorder on change (forwards)', () => {
    expect(
      shuffle([
        {
          id: 1,
          seq: 3,
          type: 'Note',
          updatedAt: '2021-11-11T19:29:02.073Z',
        },
        {
          id: 2,
          seq: 3,
          type: 'Note',
          updatedAt: '2021-11-11T19:31:02.073Z',
        },
        {
          id: 3,
          seq: 1,
          type: 'Note',
        },
        {
          id: 4,
          seq: 4,
          type: 'Note',
        },
      ]),
    ).toEqual([
      {
        id: 1,
        seq: 2,
        type: 'Note',
        updatedAt: '2021-11-11T19:29:02.073Z',
      },
      {
        id: 2,
        seq: 3,
        type: 'Note',
        updatedAt: '2021-11-11T19:31:02.073Z',
      },
      {
        id: 3,
        seq: 1,
        type: 'Note',
      },
      {
        id: 4,
        seq: 4,
        type: 'Note',
      },
    ]);
  });

  it('should reorder on change (duplicates)', () => {
    expect(
      shuffle([
        {
          id: 1,
          seq: 3,
          type: 'Note',
          updatedAt: '2021-11-11T19:29:02.073Z',
          isModified: jest.fn().mockReturnValue(true),
        },
        {
          id: 2,
          seq: 3,
          type: 'Note',
          updatedAt: '2021-11-11T19:29:02.073Z',
          isModified: jest.fn().mockReturnValue(false),
        },
        {
          id: 3,
          seq: 1,
          type: 'Note',
        },
        {
          id: 4,
          seq: 4,
          type: 'Note',
        },
      ]),
    ).toEqual([
      {
        id: 1,
        seq: 3,
        type: 'Note',
        updatedAt: expect.any(String),
      },
      {
        id: 2,
        seq: 2,
        type: 'Note',
        updatedAt: '2021-11-11T19:29:02.073Z',
      },
      {
        id: 3,
        seq: 1,
        type: 'Note',
      },
      {
        id: 4,
        seq: 4,
        type: 'Note',
      },
    ]);
  });
});
