const { intercept } = require('q3-core-session');

// used in access control test
intercept('TESTING', () => 'Hidden');
