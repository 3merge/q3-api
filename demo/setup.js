const Q3 = require('q3-api');
const flat = require('flat');
const {
  first,
  pick,
  isUndefined,
  round,
} = require('lodash');
const Comparison = require('comparisons');

const AutomationSchema = new Q3.Database.Schema({
  name: String,
  action: String,
  trigger: String,
  condition: [String],
});

const FieldSchema = new Q3.Database.Schema({
  type: String,
  required: Boolean,
  dedupe: Boolean,
  unique: Boolean,
  gram: Boolean,
  name: String,
});

const m = Q3.Database.model('model-config', {
  collectionName: { type: String, required: true },
  collectionSingularName: String,
  collectionPluralName: String,
  automation: [AutomationSchema],
  fields: [FieldSchema],
});

Q3.Database.model('products', {
  name: String,
  price: Number,
});

module.exports = Q3.Database.connect(
  process.env.CONNECTION,
  {
    poolSize: 1,
  },
)
  .then(async (conn) => {
    const r = await m.find({}).lean().exec();
    r.forEach((d) => {
      const Schema = new Q3.Database.Schema(
        [
          ...d.fields,
          {
            name: 'items.0.quantity',
            type: 'Number',
          },
          {
            name: 'items.0.name',
            type: 'String',
          },
          {
            name: 'items.0.price',
            type: 'Number',
            default: 0,
          },
          {
            name: 'items.0.subtotal',
            type: 'Number',
            default: 0,
          },
          {
            name: 'total',
            type: 'Number',
          },
          {
            name: 'status',
            type: 'String',
          },
        ].reduce((acc, { name, ...rest }) => {
          const parts = name.split('.0.');

          if (parts.length > 1) {
            if (!acc[parts[0]])
              acc[parts[0]] = [new Q3.Database.Schema({})];

            acc[parts[0]][0].add({
              [parts[1]]: rest,
            });
          } else {
            acc[name] = rest;
          }

          return acc;
        }, {}),
        {
          restify: '*',
          ...pick(d, [
            'collectionSingularName',
            'collectionPluralName',
          ]),
        },
      );

      Schema.pre('save', function () {
        d.automation.forEach((rule) => {
          const raw = this.toJSON();
          if (
            rule.trigger === 'isModified' &&
            rule.condition.some((item) =>
              this.isModified(first(item.split(/(!|=)/))),
            )
          ) {
            const hasBeenModified = new Comparison(
              rule.condition,
            ).eval(raw);

            if (hasBeenModified) {
              rule.actions.forEach((action) => {
                if (action.type === 'updateValue')
                  this.set(action.target, action.value);
                else if (action.type === 'sendEmail')
                  console.log('EMAIL');
              });
            }
          } else if (rule.trigger === 'query') {
            Q3.model(rule.collection).findOne(
              Object.entries(rule.query).reduce(
                (acc, curr) => {
                  const v = curr[1];

                  // REPLACE??

                  acc[curr[0]] = v;
                  return acc;
                },
                {},
              ),
            );
          } else if (rule.trigger === 'isFunction') {
            let data;

            if (rule.template === 'sum') {
              const flattened = flat(raw);
              data = rule.input.reduce((acc, field) => {
                Object.entries(flattened).forEach(
                  ([k, v]) => {
                    if (new RegExp(field).test(k)) {
                      acc += v;
                    }
                  },
                );

                return acc;
              }, 0);

              if (rule.arguments) {
                if (
                  typeof rule.arguments.round === 'number'
                ) {
                  data = round(data, rule.arguments.round);
                }
              }

              this.set(rule.output, data);
            } else {
              const copy = rule.in ? raw[rule.in] : raw;

              const runSet = (sub, i) => {
                const flattened = flat(sub);
                let inner = rule.input.reduce(
                  (acc, field) => {
                    Object.entries(flattened).forEach(
                      ([k, v]) => {
                        if (new RegExp(field).test(k)) {
                          acc *= v;
                        }
                      },
                    );

                    return acc;
                  },
                  1,
                );

                if (rule.arguments) {
                  if (
                    typeof rule.arguments.round === 'number'
                  ) {
                    inner = round(
                      inner,
                      rule.arguments.round,
                    );
                  }
                }

                if (!isUndefined(i))
                  this.set(
                    `${rule.in}.${i}.${rule.output}`,
                    inner,
                  );
                else this.set(`${rule.output}`, inner);
              };

              if (Array.isArray(copy)) {
                copy.forEach(runSet);
              } else {
                runSet(copy);
              }
            }
          }
        });
      });

      Q3.Database.model(d.collectionName, Schema);
    });

    return conn.disconnect();
  })
  .catch((e) => {
    // eslint-disable-next-line
    console.log(e);
  });
