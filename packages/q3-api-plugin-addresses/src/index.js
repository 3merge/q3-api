import E3, { Errors } from 'starter-e3';
import schema from './schema';
import routes from './routes';

export default routes;

export const plugin = (collectionSchema, opts = {}) => {
  collectionSchema.add({
    addresses: [schema],
  });

  if (opts.singleBilling)
    // eslint-disable-next-line
    collectionSchema.pre('save', function(next) {
      if (
        this.addresses.filter(
          (address) => address.kind === 'Billing',
        ).length > 1
      ) {
        next(
          new Errors.ValidationError(
            E3.translate(
              'message:multipleBillingAddresses',
            ),
          ),
        );
      }

      // move on
      next();
    });
};
