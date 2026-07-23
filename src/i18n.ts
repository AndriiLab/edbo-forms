import { createTranslator } from '@jsonforms/core';
import type { Translator } from '@jsonforms/core';
import type { ErrorObject } from 'ajv';

// Translates AJV validation error messages to Ukrainian.
// Only errors carry a `values.error` payload (see defaultErrorTranslator in
// @jsonforms/core); everything else falls through to defaultMessage untouched.
export const ukrainianTranslate: Translator = createTranslator(
  (_id, defaultMessage, values) => {
    const error = values?.error as ErrorObject | undefined;
    if (!error) {
      return defaultMessage;
    }

    switch (error.keyword) {
      case 'required':
        return "Обов'язкове поле не заповнено";
      case 'format':
        return error.params.format === 'date'
          ? 'Некоректна дата'
          : 'Некоректний формат значення';
      case 'pattern':
        return 'Значення не відповідає необхідному формату';
      case 'enum':
        return 'Оберіть значення зі списку допустимих';
      case 'type':
        return `Некоректний тип значення (очікується: ${error.params.type})`;
      default:
        return defaultMessage;
    }
  }
);
