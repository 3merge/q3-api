const split = (s = '') =>
  String(s)
    .split('=')
    .map((v) => v.trim());

module.exports = class Statements {
  constructor(a) {
    this.commands = Array.isArray(a) ? a : [];
  }

  get eligible() {
    return this.commands
      .filter((v) => v.includes('='))
      .map((v) => v.trim());
  }

  compare(obj) {
    return this.eligible.every((s) => {
      const [prop, value] = split(s);
      if (!(prop in obj)) return false;
      return (
        String(obj[prop]).localeCompare(
          String(value),
          'en',
          {
            sensitivity: 'base',
          },
        ) === 0
      );
    });
  }

  get() {
    return this.eligible.reduce((a, s) => {
      const [prop, value] = split(s);
      return a.concat({
        [prop]: value,
      });
    }, []);
  }
};
