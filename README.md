# Form CMS – Frontend Demo

A React/Vite frontend prototype for a campaign Form CMS. It uses browser LocalStorage and mock data only.

## Requirements
- Node.js 18+ (Node.js 20 LTS recommended)
- npm

## Run locally
```bash
cd form-cms-demo
npm install
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Included demo features
- Dashboard with summary cards and recent activity
- Form builder with 15 predefined field types
- Native HTML drag-and-drop for adding and reordering fields
- Field configuration panel (labels, placeholders, options, required state, help text)
- Save draft, publish/unpublish, duplicate and delete forms
- Desktop/mobile form preview with basic validation and demo submission
- Form templates and submission management
- LocalStorage persistence

## Important scope notes
- No custom field-type creation: the field library is fixed in `src/App.jsx` (`FIELD_TYPES`).
- No backend, Node/Express API, PostgreSQL database, authentication, Salesforce connection or real publishing is implemented.
- "Publish" changes the form status in local demo storage; it does not deploy a public form.
- File upload is represented in preview; selected file name is stored only in the current preview state.
- Data is stored in the browser where the demo is run. Clearing browser storage removes saved demo data.

## Project structure
```text
form-cms-demo/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    └── services/
        └── storage.js
```

## Reset demo data
Open browser developer tools → Application/Storage → Local Storage → delete `form-cms-demo-v1`, then refresh.
