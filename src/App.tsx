import { Fragment, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { DoiInputControlFactory, doiInputTester } from './DoiInputControl';
import AccordionGroupRenderer, {
  accordionGroupTester,
} from './AccordionGroupRenderer';
import CategorizationStepperRenderer, {
  categorizationStepperTester,
} from './CategorizationStepperRenderer';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import './App.css';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import { makeStyles } from '@mui/styles';
import { AlertColor } from '@mui/material/Alert';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import { ukrainianTranslate } from './i18n';

// data load
const variant = import.meta.env.VITE_APP_VARIANT || 'employee';

let schema: any;
let uischema: any;
let formData: any;

if (variant === 'student') {
  schema = await import('./student/schema.json');
  uischema = await import('./student/uischema.json');
  formData = await import('./student/data.json');
} else if (variant === 'naqa-notification') {
  schema = await import('./naqa-notification/schema.json');
  uischema = await import('./naqa-notification/uischema.json');
  formData = await import('./naqa-notification/data.json');
} else {
  schema = await import('./employee/schema.json');
  uischema = await import('./employee/uischema.json');
  formData = await import('./employee/data.json');
}

dayjs.locale('uk');

const useStyles = makeStyles({
  container: {
    padding: '1em',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    padding: '0.25em',
  },
  dataContent: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.25em',
    backgroundColor: '#cecece',
    marginBottom: '1rem',
  },
  saveDataButton: {
    marginTop: '1em !important',
    margin: 'auto !important',
    display: 'block !important',
  },
  restoreDataButton: {
    marginRight: '1em !important',
  },
  loadFromFileButton: {},
  form: {
    margin: 'auto',
    padding: '1rem',
  },
  alert: {
    marginBottom: '0.25em',
  },
  wrapper: {
    height: '99vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
  },
  header: {
    display: 'inline-flex',
    height: '3em',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 'x-large',
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
  },
  footer: {
    height: '1em',
    fontSize: 'small',
    textAlign: 'right',
    backgroundColor: 'white',
  },
});

const defaultData = JSON.stringify(formData.defaultObject);
declare const __BUILD_DATE__: string;

const searchParam = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop as string),
});

// @ts-ignore
const isDebug = !!searchParam.debug;
// @ts-ignore
const disableValidation = searchParam.validate === 'false';

const App = () => {
  const classes = useStyles();
  const [data, setData] = useState<any>(formData.defaultObject);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>([]);

  const renderers = [
    ...materialRenderers,
    { tester: accordionGroupTester, renderer: AccordionGroupRenderer },
    {
      tester: categorizationStepperTester,
      renderer: CategorizationStepperRenderer,
    },
    {
      tester: doiInputTester,
      renderer: DoiInputControlFactory(data, d => {
        setData(structuredClone(d));
        setIsDirty(true);
      }),
    },
    //register custom renderers
  ];

  function buildFileName(fileNameTemplate: string, data: any): string {
    let fileName = '';
    let tag: string | null = null;
    for (const char of fileNameTemplate) {
      if (char === '{') {
        tag = '';
      } else if (char === '}') {
        fileName += getValue(data, tag?.split('.') ?? []).replace(' ', '_');
        tag = null;
      } else if (tag !== null) {
        tag += char;
      } else {
        fileName += char;
      }
    }

    return fileName;
  }

  function getValue(sourceObject: any, keys: string[]): string {
    let obj = sourceObject;
    for (let key of keys) {
      obj = obj[key];
      if (!obj) {
        return 'undefined';
      }
    }

    return obj as string;
  }

  const saveData = () => {
    if (!disableValidation && errors.length) {
      return;
    }
    const a = document.createElement('a');
    document.body.appendChild(a);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'octet/stream',
    });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = buildFileName(formData.fileName, data);
    a.click();
    window.URL.revokeObjectURL(url);
    localStorage.removeItem(formData.storageKey);
    setData(formData.defaultObject);
  };

  const restoreData = () => {
    setData(JSON.parse(localStorage.getItem(formData.storageKey) ?? '{}'));
    setIsDirty(true);
  };

  const loadFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      let target = e.target as HTMLInputElement;
      if (target?.files === null) return;
      let file = target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = readerEvent => {
        let content = readerEvent.target?.result ?? '{}';
        setData(JSON.parse(content as string));
        setIsDirty(true);
      };
    };
    input.click();
  };

  function RenderBeforeForm() {
    return formData.beforeFormAlerts.map((a: any) => (
      <Alert
        key={a.text}
        severity={a.severity as AlertColor}
        className={classes.alert}>
        {a.text}
      </Alert>
    ));
  }

  function RenderAfterForm() {
    const saveButton = (
      <Button
        disabled={!disableValidation && (!isDirty || errors.length)}
        className={classes.saveDataButton}
        onClick={saveData}
        color="primary"
        variant="contained">
        Зберегти
      </Button>
    );

    const hint1 = (
      <Alert severity="info" className={classes.alert}>
        Дані зберігаються у вашому браузері по мірі їх введення. Ви можете
        продовжити заповнення даних у будь-який момент. Для відновлення вже
        заповнених даних натисніть кнопку "Відновити"
      </Alert>
    );
    const warn = (
      <Alert severity="warning" className={classes.alert}>
        Заповніть обов'язкові поля для активації збереження
      </Alert>
    );
    const hint2 = (
      <Alert severity="info" className={classes.alert}>
        Після натиснення кнопки Зберегти, Вам буде запропоновано зберегти файл
        на Вашому ПК. Будь ласка, відправте цей файл електронним листом
      </Alert>
    );
    return [hint1, !isDirty || errors.length ? warn : hint2, saveButton];
  }

  // @ts-ignore
  const onFormChange = ev => {
    const data = JSON.stringify(ev.data);
    if (data !== defaultData) {
      setIsDirty(true);
      localStorage.setItem(formData.storageKey, data);
    }
    if (isDebug) {
      console.log(JSON.stringify(ev.errors));
    }
    setData(ev.data);
    setErrors(ev.errors);
  };

  const restoreDataButton = (
    <Button
      className={classes.restoreDataButton}
      onClick={restoreData}
      color="warning"
      variant="contained"
      disabled={!localStorage.getItem(formData.storageKey) || isDirty}>
      Відновити
    </Button>
  );

  const loadFromFileButton = (
    <Button
      className={classes.loadFromFileButton}
      onClick={loadFromFile}
      color="info"
      variant="contained">
      Відкрити
    </Button>
  );

  return (
    <Fragment>
      <div className="App"></div>
      <div className={classes.wrapper}>
        <div className={classes.header}>
          <div className={classes.headerTitle}>{formData.header}</div>
          <div>
            {restoreDataButton} {loadFromFileButton}
          </div>
        </div>
        <div className={classes.main}>
          {RenderBeforeForm()}
          <div className={classes.form}>
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={renderers}
              cells={materialCells}
              onChange={onFormChange}
              i18n={{ locale: 'uk', translate: ukrainianTranslate }}
            />
          </div>
          {RenderAfterForm()}
        </div>
        <div className={classes.footer}>Версія: {__BUILD_DATE__}</div>
      </div>
    </Fragment>
  );
};

export default App;
