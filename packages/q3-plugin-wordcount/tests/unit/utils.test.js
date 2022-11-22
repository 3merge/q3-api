const {
  cleanHtml,
  splitSentence,
} = require('../../lib/utils');

describe('WordCount utils', () => {
  describe('cleanHtml', () => {
    it('should strip out tags', () => {
      expect(
        cleanHtml('<p>This is a sentence</p>'),
      ).toEqual('This is a sentence');

      expect(
        cleanHtml(
          `<ul>
            <li>List item #1<li>
            <li>List item #2<li>
          </ul>`,
        ),
      ).toEqual('List item #1 List item #2');
    });
  });

  describe('splitSentence', () => {
    it('should split by space', () => {
      expect(
        splitSentence(`Hey, how 
          is  it going?
          `),
      ).toEqual(['hey', 'how', 'is', 'it', 'going']);
    });
  });
});
