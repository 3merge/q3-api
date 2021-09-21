const MjmlTextParser = require('../mjmlTextParser');

const clean = (xs) => xs.replace(/(\r\n|\n|\r)|\s/gm, '');

describe('MjmlTextParser', () => {
  it('should return empty array', () => {
    expect(MjmlTextParser().find()).toEqual([]);
  });

  it('should return names', () => {
    expect(
      MjmlTextParser(
        `<mjml>
          <mj-include path="test" />
          <mj-include path="test" />
          <mj-include path="test2" />
        </mjml>`,
      ).find(),
    ).toEqual(['test', 'test2']);
  });

  it('should skip malformed', () => {
    expect(
      MjmlTextParser(
        `<mjml>
          <mj-include path="test />
        </mjml>`,
      ).find(),
    ).toEqual([]);
  });

  it('should replace include statements', () => {
    expect(
      clean(
        MjmlTextParser(
          `<mjml>
          <mj-include path="test" />
          <mj-section />
        </mjml>`,
        )
          .replace([
            {
              name: 'test',
              mjml: '<mj-raw>Test</mj-raw>',
            },
          ])
          .out(),
      ),
    ).toMatch(
      clean(`<mjml>
      <mj-raw>Test</mj-raw>
      <mj-section />
    </mjml>`),
    );
  });
});
