const mongoose = require('../config/mongoose');
const { MODEL_NAMES } = require('../constants');
const Domains = require('./domains');
const DomainResources = require('./domainsResources');
const Emails = require('./emails');
const NotifiationSchema = require('./notifications');
const Users = require('./users');

const Notifications = mongoose.model(
  MODEL_NAMES.NOTIFICATIONS,
  NotifiationSchema,
);

module.exports = {
  Domains,
  DomainResources,
  Emails,
  Users,
  Notifications,
};
