require('../helpers/loadDefaultSchemaExtensionsFromRoot');
const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');
const Domains = require('./domains');
const DomainResources = require('./domainsResources');
const Emails = require('./emails');
const NotifiationSchema = require('./notifications');
const Segments = require('./segments');
const Users = require('./users');
const Counters = require('./counters');

const Notifications = mongoose.model(
  MODEL_NAMES.NOTIFICATIONS,
  NotifiationSchema,
);

module.exports = {
  Counters,
  Domains,
  DomainResources,
  Emails,
  Users,
  Notifications,
  Segments,
};
