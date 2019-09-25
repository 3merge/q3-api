module.exports = {
  plugins: ['rewire'],
  presets: [
    [
      '@babel/preset-env',
      {
        'targets': {
          'node': 'current',
        },
      },
    ],
  ],
};
