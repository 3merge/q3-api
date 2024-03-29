// eslint-disable-next-line
const { queue } = require('q3-core-scheduler');
const Schema = require('./schema');

Schema.pre('find', function changeSortOp() {
  const s = this.getOptions();

  if (s && s.sort && s.sort.name)
    this.sort({
      firstName: s.sort.name,
      lastName: s.sort.name,
    });
});

Schema.pre('save', function primeNewUserDispatcher() {
  if (this.isNew) {
    this.$dispatch = true;
    this.setSecret();
  }
});

Schema.post(
  'save',
  async function executeNewUserDispatcher() {
    if (this.$dispatch) await queue('onNewUser', this);
  },
);
