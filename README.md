# EDBO Forms

This project is a React-based application for rendering and managing various EDBO (Unified State Electronic Base on Education) forms using [JSON Forms](https://jsonforms.io).

It is built with React, Vite, and Material UI, featuring custom renderers and supporting multiple form variants.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Running the Application

The application supports multiple variants. You can start the development server for a specific variant:

- **Employee Form:** `npm run dev:employee`
- **NAQA Notification Form:** `npm run dev:naqa`
- **Student Form:** `npm run dev:student`

By default, the application runs on [http://localhost:3000](http://localhost:3000).

### Building for Production

To build all variants:
```bash
npm run build:all
```

To build a specific variant:
- `npm run build:employee`
- `npm run build:naqa`
- `npm run build:student`

The output will be in the `dist` folder.

## Project Structure

- `src/employee/`: Schema, UI schema, and sample data for the Employee variant.
- `src/naqa-notification/`: Schema, UI schema, and sample data for the NAQA Notification variant.
- `src/student/`: Schema, UI schema, and sample data for the Student variant.
- `src/App.tsx`: Main application component that dynamically loads schemas based on the `VITE_APP_VARIANT` environment variable.
- `src/AccordionGroupRenderer.tsx`: Custom renderer for accordion groups.
- `src/DoiInputControl.tsx`: Custom control for DOI input.

## Features

- **Dynamic Loading:** Loads different form schemas based on environment variables.
- **Custom Renderers:** Includes specialized UI components like accordions and DOI inputs.
- **Validation:** Built-in JSON Schema validation.
- **Data Persistence:** Supports loading and saving form data (local storage/file).
- **Localization:** Uses `dayjs` with Ukrainian locale for date handling.

## Testing and Quality

- **Linting:** `npm run lint` (ESLint)
- **Formatting:** `npm run format` (Prettier)
- **Tests:** `npm run test` (Vitest)
