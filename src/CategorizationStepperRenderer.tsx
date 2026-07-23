import { useMemo, useState } from 'react';
import { Button, Step, StepButton, Stepper } from '@mui/material';
import {
  and,
  Categorization,
  categorizationHasCategory,
  Category,
  deriveLabelForUISchemaElement,
  isVisible,
  optionIs,
  RankedTester,
  rankWith,
  StatePropsOfLayout,
  uiTypeIs,
} from '@jsonforms/core';
import {
  TranslateProps,
  withJsonFormsLayoutProps,
  withTranslateProps,
} from '@jsonforms/react';
import {
  AjvProps,
  MaterialLayoutRenderer,
  MaterialLayoutRendererProps,
  withAjvProps,
} from '@jsonforms/material-renderers';

// Overrides the built-in material-renderers stepper layout to localize the
// hardcoded "Next" / "Previous" button labels, which are not translated
// upstream (see MaterialCategorizationStepperLayout.tsx).
export const categorizationStepperTester: RankedTester = rankWith(
  3,
  and(
    uiTypeIs('Categorization'),
    categorizationHasCategory,
    optionIs('variant', 'stepper')
  )
);

interface CategorizationStepperLayoutRendererProps
  extends StatePropsOfLayout,
    AjvProps,
    TranslateProps {
  data: any;
}

const CategorizationStepperLayoutRenderer = (
  props: CategorizationStepperLayoutRendererProps
) => {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  const handleStep = (step: number) => {
    setActiveCategory(step);
  };

  const {
    data,
    path,
    renderers,
    schema,
    uischema,
    visible,
    cells,
    config,
    ajv,
    t,
  } = props;
  const categorization = uischema as Categorization;
  const appliedUiSchemaOptions = { ...config, ...uischema.options };
  const buttonWrapperStyle = {
    textAlign: 'right' as const,
    width: '100%',
    margin: '1em auto',
  };
  const buttonNextStyle = {
    float: 'right' as const,
  };
  const buttonStyle = {
    marginRight: '1em',
  };
  const categories = useMemo(
    () =>
      (categorization.elements as Category[]).filter((category: Category) =>
        isVisible(category, data, path ?? '', ajv, config)
      ),
    [categorization, data, path, ajv, config]
  );
  const childProps: MaterialLayoutRendererProps = {
    elements: categories[activeCategory].elements,
    schema,
    path,
    direction: 'column',
    visible,
    renderers,
    cells,
  };
  const tabLabels = useMemo(() => {
    return categories.map((e: Category) => deriveLabelForUISchemaElement(e, t));
  }, [categories, t]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <Stepper activeStep={activeCategory} nonLinear>
        {categories.map((_: Category, idx: number) => (
          <Step key={tabLabels[idx]}>
            <StepButton onClick={() => handleStep(idx)}>
              {tabLabels[idx]}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <div>
        <MaterialLayoutRenderer {...childProps} />
      </div>
      {appliedUiSchemaOptions.showNavButtons ? (
        <div style={buttonWrapperStyle}>
          <Button
            style={buttonNextStyle}
            variant="contained"
            color="primary"
            disabled={activeCategory >= categories.length - 1}
            onClick={() => handleStep(activeCategory + 1)}>
            {t('Next', 'Далі')}
          </Button>
          <Button
            style={buttonStyle}
            color="secondary"
            variant="contained"
            disabled={activeCategory <= 0}
            onClick={() => handleStep(activeCategory - 1)}>
            {t('Previous', 'Назад')}
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default withAjvProps(
  withTranslateProps(
    withJsonFormsLayoutProps(CategorizationStepperLayoutRenderer)
  )
);
