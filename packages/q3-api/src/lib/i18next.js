import i18next from 'i18next';
import sprintf from 'i18next-sprintf-postprocessor';

i18next.use(sprintf).init({
  lng: 'en',
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;

export const translate = (msg, variables) => {
  let args = null;
  if (Array.isArray(variables))
    args = {
      postProcess: 'sprintf',
      sprintf: variables,
    };

  return i18next.t(msg, args);
};
