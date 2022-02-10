const CONSTANTS = {
  MODEL_NAMES: {
    USERS: 'users',
    NOTIFICATIONS: 'notifications',
  },
  CONTEXT: {
    LOCALE: 'q3-session:locale',
    USER: 'q3-session:user',
    PERMISSIONS: 'q3-session:grants',
  },
};

module.exports = {
  MODEL_NAMES: CONSTANTS.MODEL_NAMES,
  CONTEXT: CONSTANTS.CONTEXT,

  change(namespace, key, newValue) {
    try {
      CONSTANTS[namespace][key] = newValue;
    } catch (e) {
      throw new Error(
        'Unknown constant path,'[(namespace, key)].join(
          '.',
        ),
      );
    }
  },
};
