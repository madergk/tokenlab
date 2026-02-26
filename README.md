# TokenLab

Visual design token explorer and variable collection builder for design systems.

Browse pre-built token libraries, customize palettes with a guided wizard, and export collections to CSS, Tailwind, or JSON.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server             |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build locally     |
| `npm run typecheck` | Run TypeScript type checking           |

## Tech Stack

- **React 18** with TypeScript
- **Vite 6** for bundling
- **Tailwind CSS v4** for styling
- **shadcn/ui** component primitives
- **Motion** for animations
- **React Router** for navigation

## Project Structure

```
src/
├── app/
│   ├── App.tsx               # Root component
│   ├── routes.ts             # Route definitions
│   └── components/
│       ├── ui/               # shadcn/ui primitives
│       ├── wizard/           # Wizard flow steps
│       ├── token-explorer.tsx # Main explorer view
│       ├── export-modal.tsx  # Export functionality
│       └── ...
├── data/                     # Token libraries & samples
└── styles/                   # CSS & theme tokens
```

## Deployment

The app builds to static files in `dist/`. Deploy to any static host:

```bash
npm run build
```

The output in `dist/` can be served by GitHub Pages, Netlify, Vercel, or any static file server.

## License

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party licenses.
