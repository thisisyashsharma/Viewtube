# ViewTube

ViewTube is a modern, high-performance video sharing platform built with the MERN stack. It features a robust backend architecture for video streaming and a responsive, scalable frontend interface.

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Features

### Authentication & Security
- Secure stateless authentication using HTTP-Only cookies with short-lived access tokens and long-lived refresh tokens.
- Native Google OAuth integration for seamless sign-ins.
- Intelligent rate limiting that protects endpoints while bypassing localhost environments during development.

### Video Pipeline
- Configurable storage strategy supporting both Local File System and Cloudinary.
- Asynchronous metadata extraction for accurate video durations and automatic thumbnail generation.
- HTTP 206 Partial Content streaming endpoints ensuring instant playback without full-file buffering.

### Social Interaction
- Infinite-depth nested comment threads.
- High-performance optimistic UI updates for likes and interactions.
- Channel subscriptions and robust user watch history tracking.
- Dedicated creator dashboard providing detailed analytics on views and subscriber growth.

### User Interface
- Fully responsive layout transitioning from desktop grid feeds to mobile drawer navigation.
- Component architecture built with Material-UI and custom Tailwind CSS utility classes.
- Resilient React error boundaries preventing white-screen crashes.

## Architecture & Tech Stack

**Frontend:** React, Vite, Redux Toolkit, Tailwind CSS, Material-UI, React Router v6
**Backend:** Node.js, Express.js, JWT, Multer, fluent-ffmpeg
**Database:** MongoDB, Mongoose
**Storage:** Local Storage, Cloudinary

### System Data Flow

```text
                     [ Vite + React Frontend ]
                                |
                   (HTTP / REST API - Port 5173 -> 8000)
                                v
                     [ Express.js API Server ]
                        /       |       \
                       v        v        v
            [ MongoDB ]   [ Storage ]   [ Local Files ]
```

## Project Structure

```text
ViewTube2ai/
├── src/                          # Express Backend Source
│   ├── controllers/              # Core business logic
│   ├── db/                       # Database connections
│   ├── middlewares/              # JWT, Multer, Rate limiting
│   ├── models/                   # Mongoose DB schemas
│   ├── routes/                   # API routing
│   └── utils/                    # Utilities and FFmpeg tools
├── UserInterface/                # React Frontend Source (Vite)
│   ├── src/
│   │   ├── components/           # UI views and components
│   │   ├── store/                # Redux state management
│   │   └── routes/               # Client-side routing
│   ├── vite.config.js            # Build configuration and proxy
│   └── package.json              # Frontend dependencies
├── public/                       # Static assets
└── package.json                  # Root dependencies and scripts
```

## API Reference

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| Auth | POST | `/api/v1/account/signup` | Register new user |
| Auth | POST | `/api/v1/account/login` | Authenticate user |
| Auth | POST | `/api/v1/account/logout` | Revoke session |
| Videos | GET | `/api/v1/videos/allVideo` | Fetch public video feed |
| Videos | POST | `/api/v1/videos/publish` | Upload video and thumbnail |
| Videos | GET | `/api/v1/videos/stream/:filename`| HTTP 206 byte-range streaming |
| Videos | GET | `/api/v1/videos/videoData/:id` | Fetch specific video details |
| Videos | DELETE | `/api/v1/videos/delete/:id` | Delete video resource |
| Social | PUT | `/api/v1/account/subscribe/:id`| Toggle channel subscription |
| Social | POST | `/api/v1/comments/:videoId` | Submit top-level comment |
| Social | PUT | `/api/v1/videos/:id/like` | Toggle video like |

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or remote cluster)

### Installation

1. Clone the repository and install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd UserInterface
npm install
cd ..
```

3. Start the development servers concurrently:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Environment Configuration

Create a `.env` file in the root directory:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

DEFAULT_STORAGE=local
```

Create a `.env` file in the `UserInterface/` directory:
```env
VITE_AUTH_PROVIDER=mongodb
VITE_API_BASE=/api/v1
```

## Troubleshooting

- **EADDRINUSE (Port Blocked):** If ports `8000` or `5173` are occupied by zombie Node processes, run the included cleanup script from the project root (Windows only):
```powershell
.\kill-ports.ps1
```
- **Vite Build / White Screens:** Application renders are wrapped in global error boundaries. Check the browser console for exact component stack traces rather than silent failures.
- **Rate Limiting Lockout:** Localhost requests (`127.0.0.1`) bypass the standard rate limit parameters when `NODE_ENV=development`.
