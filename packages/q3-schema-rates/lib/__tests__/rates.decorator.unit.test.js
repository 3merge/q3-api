const Decorator = require('../decorator');

const execMeetsThreshold = (op, value) => {
  const deco = new Decorator();
  deco.threshold = `${op}10`;
  return deco.meetsThreshold(value);
};

describe('Rates decorator', () => {
  it('should match strict equals', () => {
    expect(execMeetsThreshold('==', 10)).toBeTruthy();
    expect(execMeetsThreshold('==', 9)).toBeFalsy();
  });

  it('should match greater than', () => {
    expect(execMeetsThreshold('>', 11)).toBeTruthy();
    expect(execMeetsThreshold('>', 9)).toBeFalsy();
  });

  it('should match greater than', () => {
    expect(execMeetsThreshold('<', 9)).toBeTruthy();
    expect(execMeetsThreshold('<', 11)).toBeFalsy();
  });

  it('should match greater than or equal to', () => {
    expect(execMeetsThreshold('>=', 11)).toBeTruthy();
    expect(execMeetsThreshold('>=', 10)).toBeTruthy();
    expect(execMeetsThreshold('>=', 9)).toBeFalsy();
  });

  it('should match less than or equal to', () => {
    expect(execMeetsThreshold('<=', 9)).toBeTruthy();
    expect(execMeetsThreshold('<=', 10)).toBeTruthy();
    expect(execMeetsThreshold('<=', 11)).toBeFalsy();
  });
});
