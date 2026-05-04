import { rankWith, uiTypeIs } from '@jsonforms/core';
import { MaterialLayoutRenderer } from '@jsonforms/material-renderers';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import { withJsonFormsLayoutProps } from '@jsonforms/react';

// @ts-ignore
const AccordionGroupRenderer = props => {
  const { uischema, schema, path, visible, renderers } = props;

  return (
    <Accordion sx={{ display: visible ? 'block' : 'none' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{uischema.label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <MaterialLayoutRenderer
          direction={'column'}
          elements={uischema.elements}
          schema={schema}
          path={path}
          visible={visible}
          renderers={renderers}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default withJsonFormsLayoutProps(AccordionGroupRenderer);

export const accordionGroupTester = rankWith(1000, uiTypeIs('AccordionGroup'));
