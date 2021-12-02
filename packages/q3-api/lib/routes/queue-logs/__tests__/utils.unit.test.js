const Scheduler = require('q3-core-scheduler');
const moment = require('moment');
const utils = require('../utils');

describe('queuelogs utils', () => {
  it('should calculate expected end date', async () => {
    const spy = jest
      .spyOn(Scheduler.__$db, 'aggregate')
      .mockResolvedValue([
        {
          _id: 'foo',
          average: 850,
        },
        {
          _id: 'bar',
          average: 122,
        },
      ]);

    const avg = await utils.calculateAverageDuration();
    expect(spy).toHaveBeenCalledWith([
      {
        $match: expect.objectContaining({
          name: {
            $exists: true,
          },
        }),
      },
      expect.any(Object),
    ]);

    const d = moment();
    const iso = d.toISOString();

    expect(avg({ name: 'foo', due: iso })).toMatch(
      d.add(850, 'ms').toISOString(),
    );

    expect(avg({ name: 'quuz', due: iso })).toMatch(iso);
  });

  it('should get duration in seconds', () => {
    expect(utils.getDuration({ duration: 3500 })).toBe(4);
    expect(utils.getDuration({})).toBe(0);
  });

  it('should return as In Progress', () => {
    expect(
      utils.getResolvedStatus({
        status: 'Queued',
        locked: true,
      }),
    ).toMatch('In Progress');
  });

  it('should return as Scheduled', () => {
    expect(
      utils.getResolvedStatus({
        status: 'Queued',
        locked: false,
      }),
    ).toMatch('Scheduled');
  });

  it('should return status', () => {
    expect(
      utils.getResolvedStatus({
        status: 'Done',
      }),
    ).toMatch('Done');
  });
});
