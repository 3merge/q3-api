jest.unmock('express-validator');

const Ctrl = require('../get');

const CARS = [
  'Ford',
  'Mitsubishi',
  'Honda',
  'Plymouth',
  'Dodge',
  'Mazda',
  'Chevrolet',
  'Mercedes-Benz',
  'GMC',
  'Lamborghini',
  'Lincoln',
  'Land Rover',
  'Isuzu',
  'Mazda',
  'Maserati',
  'Buick',
  'Ford',
  'Chevrolet',
  'Chevrolet',
  'Mercury',
  'Ford',
  'Lincoln',
  'Chrysler',
  'Mitsubishi',
  'Ford',
  'Ford',
  'Volkswagen',
  'Lincoln',
  'Ford',
  'Mazda',
  null,
  undefined,
  0,
];

describe('distinct', () => {
  it('should return 25 results', () =>
    expect(Ctrl.filterByWord(CARS)).toHaveLength(25));

  it('should return matching results', () =>
    expect(Ctrl.filterByWord(CARS, 'ma')).toHaveLength(4));
});
