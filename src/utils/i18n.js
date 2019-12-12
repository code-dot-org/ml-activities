import data from '../../i18n/oceans.js';

let messages;
let locale = 'en';
export const init = loc => {
  messages = data;
  // Check that we support this locale
  if (messages[loc]) {
    locale = loc;
  }
};

export const t = (key, options) => {
  if (messages[locale][key]) {
    return messages[locale][key](options);
  } else {
    return messages['en'][key](options);
  }
};
