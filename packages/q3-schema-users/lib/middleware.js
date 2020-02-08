const { emit } = require('q3-core-mailer');
const Schema = require('./schema');

Schema.pre('save', function primeNewUserDispatcher() {
  if (this.isNew) {
    this.$dispatch = true;
    this.setSecret();
  }
});

Schema.post('save', function executeNewUserDispatcher() {
  if (this.$dispatch) emit('onNewUser', this);
});
