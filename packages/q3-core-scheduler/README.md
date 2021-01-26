# Scheduler

For handling background processes in your application use Q3
Scheduler. We recommended running the scheduler on an
independent server since it uses MongoDB as a persistence
layer. This way, your web requests and your jobs don't need
to compete for resources.

## `Scheduler.queue`

To add one-time jobs, call the `queue` method. It takes two
arguments: the name and the payload (optional). The payload
can contain any data, though it will process the `buckets`
and `session` properties differently.

If the payload contains `buckets`, the receiving function
will have file attachments in its second parameter position.
Likewise, if the payload contains `session`, it will hydrate
the `q3-core-session` module before executing the file.

```javascript
const Scheduler = require('q3-core-scheduler');

Scheduler.queue('file', {
  buckets: [],
  session: {},
  id: 1,
}).then(() => {
  // will eventually call the file below at chores/file.js
});

module.exports = (data, attachments) => {
  console.log('Regular data:', data);
  console.log('File buffers:', attachments);
};
```

## `Scheduler.seed`

When the scheduler receives a target directory, it will walk
the files in it looking for recurring jobs. Recurring jobs
have files ending in `@${interval}.js`. Acceptable interval
values include `annually`, `biannually`, `quarterly`,
`monthly`, `weekly`, `daily`, `bihourly`, `hourly`,
`semihourly`, `biminutely` and `minutely`.

```javascript
const Scheduler = require('q3-core-scheduler');

// tells the scheduler to look for jobs in this directory
Scheduler.seed(__dirname).then(() => {
  console.log('Recurring jobs saved');
});
```

## `Scheduler.start`

Given an executable directory and an interval, the queue
manager can run. It will work by priority sequence (high to
low) and lock any jobs in progress, processing just one at a
time. After execution, the queue manager will stamp a
completition date (iso) and duration (ms) for benchmarking
and debugging purposes.

```javascript
const Scheduler = require('q3-core-scheduler');

// tells the scheduler to execute files in this directory
// every 10 milliseconds
Scheduler.start(__dirname, 10).then(() => {
  console.log('Queue manager started');
});
```

## Events

Scheduler implements a custom `EventEmitter` and exposes its
`on` listener publicly. During the queueing process, each
job will emit two of three events.

1.  `Scheduler.on("start")`: Every job emits this event
    before it executes;
2.  `Scheduler.on("finish")`: Successful jobs emit this
    event before the queue starts to look for the next job;
3.  `Scheduler.on("stall")`: Failed jobs emit this when an
    error occurs during execution.

Alternatively, when a new job gets added, the emitter will
fire the `queued` event.
