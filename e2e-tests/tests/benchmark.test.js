const {
  PerformanceObserver,
  performance,
} = require('perf_hooks');
const setup = require('../fixtures');
const { teardown } = require('../helpers');

const time = (fn, expectedBenchmark) => (done) => {
  const obs = new PerformanceObserver((items) => {
    const [{ duration }] = items.getEntries();
    console.log(duration);
    expect(duration).toBeLessThan(expectedBenchmark);
    performance.clearMarks();
    done();
  });

  obs.observe({
    entryTypes: ['measure'],
  });

  performance.mark('A');

  return fn(() => {
    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
  });
};

let Authorization;
let agent;
let id;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());

  ({
    body: {
      student: { id },
    },
  } = await agent
    .post('/students', {
      name: 'Morty Smith',
      age: 14,
    })
    .set({ Authorization })
    .expect(201));
});

afterAll(teardown);

describe('benchmarks', () => {
  it(
    'should ',
    time(async (stop) => {
      await agent
        .get('/profile')
        .set({ Authorization })
        .expect(200);

      stop();
    }, 80),
  );

  it.only(
    'should run save middleware',
    time(async (stop) => {
      await agent
        .patch(`/students/${id}`, {
          socialStatus: 'Shy',
        })
        .set({ Authorization })
        .expect(200);

      stop();
    }, 55),
  );
});
