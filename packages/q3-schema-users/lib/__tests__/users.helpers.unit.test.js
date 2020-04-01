jest.unmock('generate-password');

const { getPassword } = require('../helpers');

describe('User helpers', () => {
  describe('"getPassword"', () => {
    it('should not generate with excluded characters', () => {
      const parts = [
        ' ',
        ';',
        ':',
        '+',
        '=',
        '-',
        '(',
        ')',
        "',",
        '.',
        '^',
        '{',
        '}',
        '[',
        ']',
        '<',
        '>',
        '/',
        '\\',
        '|',
        '_',
        '~',
      ];

      for (let i = 0; i < 10; i += 1) {
        const pass = getPassword();
        const res = parts.every(
          (char) => !pass.includes(char),
        );

        expect(res).toBeTruthy();
      }
    });
  });
});
