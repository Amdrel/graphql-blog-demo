/* tslint:disable:object-literal-key-quotes */

interface Translation {
  [locale: string]: string;
}

interface Translations {
  [string: string]: Translation;
}

/**
 * All human-readable strings and their translations are stored here.
 */
const translations: Translations = {
  'InternalError': {
    'en': `Unable to process request due to an internal error.`,
  },
  'EmailClaimedError': {
    'en': `Email is already in use by another account.`,
  },
};

/**
 * Fetches a string message for a desired string in a chosen language.
 * @param string
 * @param locale
 */
export function getLocaleString(string: string, locale = 'en'): string {
  if (!(string in translations)) {
    throw new Error(`Unsupported translation string requested.`);
  }

  const candidates = translations[string];
  let actualLocale = locale;
  if (!(locale in candidates)) {
    actualLocale = 'en';
  }

  if (!(actualLocale in candidates)) {
    throw new Error(`No translations are available for the requested string.`);
  }

  return candidates[actualLocale];
}
