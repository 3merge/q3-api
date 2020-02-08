exports.getUserBase = (args) => ({
  firstName: 'Larry',
  lastName: 'Gothrup',
  email: 'lgothrup0@discovery.com',
  lang: 'en-CA',
  role: 'Developer',
  ...args,
});
