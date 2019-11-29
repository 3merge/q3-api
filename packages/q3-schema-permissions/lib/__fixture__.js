module.exports = [
  {
    op: 'Create',
    ownership: 'Any',
    coll: 'Products',
    role: 'Administrator',
    fields: '*',
  },
  {
    op: 'Update',
    ownership: 'Own',
    coll: 'Events',
    role: 'Administrator',
    fields: 'name, price.*',
  },
  {
    op: 'Delete',
    ownership: 'Own',
    coll: 'Products',
    role: 'Administrator',
  },
  {
    op: 'Update',
    ownership: 'Own',
    coll: 'Products',
    role: 'Developer',
  },
  {
    op: 'Delete',
    ownership: 'Shared',
    coll: 'Events',
    role: 'Developer',
  },
];
