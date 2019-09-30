import Q3, { Errors } from 'q3-api';
import EventsEmitter from 'events';

const { ValidationError } = Errors;

export const MODEL_NAME = 'q3-users';
export const Events = new EventsEmitter();

export const matchWithConfirmation = (value, { req }) => {
  if (value !== req.body.confirmNewPassword)
    throw new ValidationError(
      Q3.translate('validations:confirmationPassword'),
    );

  return value;
};
