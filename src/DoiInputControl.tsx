import {
  ControlProps,
  OwnPropsOfControl,
  rankWith,
  scopeEndIs,
} from '@jsonforms/core';
import {
  MaterialInputControl,
  MuiInputText,
} from '@jsonforms/material-renderers';
import React, { ComponentType, useState } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { Box, IconButton, Tooltip } from '@mui/material';

const DoiInputControl = (
  formData: any,
  setFormData: React.Dispatch<any>,
  props: ControlProps,
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function getSourceObject(formData: any, paths: string[]): any {
    let obj = formData;
    for (let path of paths) {
      if (obj.isArray) {
        const num = Number(path);
        obj = obj[num];
      } else obj = obj[path];
    }

    return obj;
  }

  const loadFromDoi = async () => {
    const doi = props.data;
    if (!doi || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch(`https://api.crossref.org/works/${doi}`);
      if (!response.ok) {
        alert(`Не вдалося завантажити посилання за DOI ${doi}`);
        return;
      }

      const data = (await response.json()) as DoiResponse;
      if (data?.status !== 'ok') {
        alert(
          `Не вдалося завантажити посилання за DOI ${doi}: невідомий статус ${data?.status}`,
        );
        console.log(data);
        return;
      }
      const year = data.message.published['date-parts'][0][0];
      const link = data.message.resource.primary.URL ?? data.message.URL;
      const hasSoleAuthorship = data.message.author?.length === 1;
      let description = '';
      for (const author of data.message.author ?? []) {
        if (!author.given && !author.family) continue;
        if (description) description += ', ';
        description += `${author.given} ${author.family}`;
      }
      description += `. ${data.message.title[0]}. ${data.message['container-title'][0]}, ${year}, ${data.message.volume}(${data.message.issue}), ${data.message.page}`;

      const sourceObject = getSourceObject(
        formData,
        props.path.split('.').slice(0, -1),
      );
      sourceObject['issn'] = data.message.ISSN[0];
      sourceObject['description'] = description;
      sourceObject['hasSoleAuthorship'] = hasSoleAuthorship;
      sourceObject['link'] = link;
      sourceObject['year'] = year.toString();
      setFormData(formData);
    } catch (error) {
      alert(
        `Помилка при завантаженні посилання за DOI ${doi}: ${(error as Error).message}`,
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Box
      sx={{ display: props.visible ? 'flex' : 'none', alignItems: 'center' }}>
      <MaterialInputControl
        input={MuiInputText}
        {...props}
        enabled={!isLoading && props.enabled}
      />
      <Tooltip title="Отримати інші поля з DOI">
        <IconButton
          type="button"
          sx={{ p: '10px' }}
          aria-label="search"
          onClick={loadFromDoi}>
          <TravelExploreIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const DoiInputControlFactory = (
  data: any,
  setData: React.Dispatch<any>,
): ComponentType<OwnPropsOfControl> =>
  withJsonFormsControlProps(p => DoiInputControl(data, setData, p));

export const doiInputTester = rankWith(100, scopeEndIs('doi'));

interface DoiAuthor {
  given: string;
  family: string;
  sequence: string;
}

interface DoiResource {
  primary: DoiResource2;
}

interface DoiResource2 {
  URL: string;
}

interface DoiReference {
  'container-title': string[];
}

class DoiDate {
  'date-parts': number[][];
}

interface DoiIssnType {
  value: string;
  type: string;
}

interface DoiMessage {
  DOI: string;
  ISSN: string[];
  URL: string;
  title: string[];
  'issn-type': DoiIssnType[];
  'container-title': string[];
  volume: string;
  issue: string;
  page: string;
  author: DoiAuthor[];
  resource: DoiResource;
  reference: DoiReference;
  published: DoiDate;
}

interface DoiResponse {
  status: string;
  message: DoiMessage;
}
