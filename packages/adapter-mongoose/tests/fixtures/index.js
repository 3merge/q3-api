/* eslint-disable no-param-reassign */
const MongooseAdapter = require('../../lib');

const Sample = MongooseAdapter.Factory.load({
  name: String,
  inc: Number,
});

Sample.query(async (data) => {
  // pre find..
});

Sample.before(async (data) => {
  data *= 10;
});

Sample.during(async (data, context = {}) => {
  const f = await context?.datasource?.rates?.find();
  lastModifiedBy = context?.session?.USER?.name;
});

Sample.after(async () => {
  // noop
});

Sample.process(async () => {
  // noop
});

module.exports = Sample.build('sample');
