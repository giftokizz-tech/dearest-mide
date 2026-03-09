<<<<<<< HEAD
# Dearest Mide - Blog Platform

A modern blog platform with separate admin and user interfaces. The admin dashboard allows bloggers to create, edit, and manage content, while the user site provides a clean reading experience for blog visitors.

## 🎯 Project Overview

**Dearest Mide** is a full-stack blog application designed with a microservices-inspired architecture. It separates concerns between content management (admin) and content consumption (user-facing), ensuring scalability and maintainability.

## 📋 Features

### Admin Application
- Blog post creation and editing
- Post publishing/unpublishing
- Category and tag management
- Draft and scheduled posts
- Analytics and post performance metrics
- User management and permissions
- SEO optimization tools
- Media/image management
- Comment moderation

### User Application
- Browse published blog posts
- Search and filter posts by category/tags
- Responsive blog reading interface
- Comment section on posts
- Author profiles
- Related posts suggestions
- Social sharing options
- Dark/light theme toggle

## 📁 Project Structure

```
dearest-mide/
├── admin/                          # Admin Dashboard Application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Admin pages (Dashboard, Posts, Users, etc.)
│   │   ├── services/              # API services
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── context/               # Context API for state management
│   │   ├── types/                 # TypeScript interfaces
│   │   └── styles/                # Global and component styles
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local
│
├── user/                           # User-Facing Blog Application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Blog pages (Home, Post Detail, Search, etc.)
│   │   ├── services/              # API services
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── context/               # Context API for state management
│   │   ├── types/                 # TypeScript interfaces
│   │   └── styles/                # Global and component styles
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local
│
├── backend/                        # Backend API Server
│   ├── src/
│   │   ├── models/                # Database models
│   │   ├── routes/                # API routes
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/            # Authentication, logging, etc.
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Helper functions
│   │   ├── config/                # Configuration files
│   │   └── database/              # Database setup and migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── shared/                         # Shared utilities and types
│   ├── types/                     # Shared TypeScript interfaces
│   ├── constants/                 # Shared constants
│   └── utils/                     # Shared utility functions
│
├── docker-compose.yml             # Docker configuration for local development
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend (Admin & User)
- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Vite** - Build tool (or Next.js as alternative)
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Redux/Context API** - State management

### Backend
- **Node.js** with Express - Server framework
- **MongoDB/PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Cors** - Cross-origin requests
- **Dotenv** - Environment variables

### DevOps & Tools
- **Docker** - Containerization
- **Git** - Version control
- **Postman/Insomnia** - API testing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB/PostgreSQL (depending on choice)
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dearest-mide.git
   cd dearest-mide
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install admin app dependencies**
   ```bash
   cd ../admin
   npm install
   ```

4. **Install user app dependencies**
   ```bash
   cd ../user
   npm install
   ```

5. **Configure environment variables**
   - Create `.env` in `/backend` with database and server configs
   - Create `.env.local` in `/admin` with API endpoint
   - Create `.env.local` in `/user` with API endpoint

### Running Locally

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

#### Terminal 2 - Admin App
```bash
cd admin
npm run dev
# Runs on http://localhost:3000
```

#### Terminal 3 - User App
```bash
cd user
npm run dev
# Runs on http://localhost:5173
```

#### Using Docker Compose (Alternative)
```bash
docker-compose up
```

## 📖 API Documentation

The backend API is RESTful and includes endpoints for:
- **Authentication**: Login, logout, register
- **Posts**: Create, read, update, delete, search, filter
- **Categories**: CRUD operations
- **Tags**: CRUD operations
- **Comments**: Create, read, update, delete
- **Users**: Admin user management
- **Files**: Upload and manage media

See [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for detailed endpoints.

## 🔐 Authentication & Authorization

- Admin app requires authentication (email + password)
- JWT tokens used for secure API requests
- Role-based access control (Admin, Editor, Viewer)
- User app has optional login for commenting

## 📝 Development Guidelines

1. **Branch naming**: `feature/feature-name`, `bugfix/bug-name`
2. **Commit messages**: Use conventional commits (feat:, fix:, docs:, etc.)
3. **Code style**: Use ESLint and Prettier
4. **Testing**: Write tests for critical features

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

For questions or issues, please open an issue on GitHub or contact the maintainer.

---

**Happy Blogging! ✨**
=======
# dearest-mide

This repository contains the code for a blog platform with **separate codebases for the admin dashboard and the public blog site** so different developers can work independently.

## Structure

- `admin/` – Bootstrap-powered admin dashboard (post creation/editing, publishing, categories/tags, drafts/scheduling, analytics, users/permissions, SEO tools, media, comments).
- `blog/` – Bootstrap-powered public-facing blog website (home page, article listing, etc.).

To preview locally, open `admin/index.html` for the dashboard and `blog/index.html` for the main blog in your browser.
>>>>>>> a2516fd9cb85cab7938c59ebd980eef8e814c89e
