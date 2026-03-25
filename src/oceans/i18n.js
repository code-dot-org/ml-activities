import data from '../../i18n/oceans.json';
import MessageFormat from 'messageformat'

let messages;

const initI18n = (i18n = {}, locale = 'en') => {
  const mf = new MessageFormat(locale);

  // Compile English defaults as the base.
  const compiled = mf.compile(data);

  // If overrides were provided, determine whether they are raw strings
  // (from a JSON locale file) or pre-compiled functions (from the host app).
  let compiledOverrides = {};
  const values = Object.values(i18n);
  if (values.length > 0) {
    if (typeof values[0] === 'string') {
      compiledOverrides = mf.compile(i18n);
    } else {
      compiledOverrides = i18n;
    }
  }

  messages = {...compiled, ...compiledOverrides};
};

const t = (key, options) => {
  if (!messages) {
    throw "I18n must be initialized before calling t";
  }
  return messages[key](options);
};

export default {
  initI18n,
  t
};
