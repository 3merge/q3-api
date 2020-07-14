const MODEL_NAMES = {
  USERS: 'q3-api-users',
  PERMISSIONS: 'q3-api-permissions',
  LOGS: 'q3-api-logs',
  VERSIONS: 'q3-api-versions',
  NOTES: 'q3-api-notes',
  REPORTS: 'q3-api-reports',
  NOTIFICATIONS: 'q3-api-notifications',
};

const CONTEXT = {
  LOCALE: 'q3-session:locale',
  USER: 'q3-session:user',
  PERMISSIONS: 'q3-session:grants',
};

module.exports = {
  MODEL_NAMES,
  CONTEXT,
};
