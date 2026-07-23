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

  function pickIssn(message: DoiMessage): string | undefined {
    if (!message.ISSN?.length) return undefined;
    const printIssn = message['issn-type']?.find(t => t.type === 'print');
    return printIssn?.value ?? message.ISSN[0];
  }

  function buildAuthorList(message: DoiMessage): string {
    let authors = '';
    for (const author of message.author ?? []) {
      if (!author.given && !author.family) continue;
      if (authors) authors += ', ';
      authors += `${author.given} ${author.family}`;
    }
    return authors;
  }

  function buildDescription(message: DoiMessage, year: number): string {
    const authors = buildAuthorList(message);
    const containerTitle = message['container-title']?.[0];
    let description = `${authors ? authors + '. ' : ''}${message.title[0]}.`;

    switch (message.type) {
      case 'book-chapter':
        if (containerTitle) description += ` В кн.: ${containerTitle}.`;
        if (message.publisher) description += ` ${message.publisher},`;
        description += ` ${year}`;
        if (message.page) description += `, ${message.page}`;
        break;
      case 'book':
      case 'monograph':
        if (message.publisher) description += ` ${message.publisher},`;
        description += ` ${year}`;
        break;
      case 'journal-article':
        description += ` ${containerTitle ?? ''}, ${year}`;
        if (message.volume) {
          description += `, ${message.volume}${message.issue ? `(${message.issue})` : ''}`;
        }
        if (message.page) description += `, ${message.page}`;
        break;
      default:
        description += ` ${year}`;
    }

    return description;
  }

  const CROSSREF_TYPE_TO_PUBLICATION_TYPE: Record<string, string> = {
    'book-chapter': 'Розділ у монографії',
    book: 'Монографія',
    monograph: 'Монографія',
  };

  function guessPublicationType(message: DoiMessage): string | undefined {
    return message.type
      ? CROSSREF_TYPE_TO_PUBLICATION_TYPE[message.type]
      : undefined;
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
      const description = buildDescription(data.message, year);
      const issn = pickIssn(data.message);
      const keywords = data.message.subject?.length
        ? data.message.subject.join(', ')
        : undefined;
      const publicationType = guessPublicationType(data.message);

      const sourceObject = getSourceObject(
        formData,
        props.path.split('.').slice(0, -1),
      );
      if (issn) sourceObject['issn'] = issn;
      if (keywords) sourceObject['keywords'] = keywords;
      if (publicationType) sourceObject['type'] = publicationType;
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
  ISSN?: string[];
  URL: string;
  title: string[];
  type?: string;
  publisher?: string;
  subject?: string[];
  'issn-type'?: DoiIssnType[];
  'container-title'?: string[];
  volume?: string;
  issue?: string;
  page?: string;
  author?: DoiAuthor[];
  resource: DoiResource;
  reference: DoiReference;
  published: DoiDate;
}

interface DoiResponse {
  status: string;
  message: DoiMessage;
}
