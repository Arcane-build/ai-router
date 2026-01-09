# AI Router

A full-stack TypeScript application with React frontend and Express backend.

## Project Structure

```
ai-router/
├── backend/          # Express + TypeScript backend
│   ├── src/
│   │   └── index.ts  # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional):
   ```bash
   PORT=3001
   NODE_ENV=development
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run type-check` - Type check without emitting files

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Type check without emitting files

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- CORS
- dotenv

### Frontend
- React 18
- TypeScript
- Vite
- Modern ES modules

## Development

The frontend is configured to proxy API requests to the backend. Make sure both servers are running for full functionality.
