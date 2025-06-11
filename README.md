# Node.js + Express.js + PostgreSQL Boilerplate

A production-ready boilerplate for building RESTful APIs with Node.js, Express.js, and PostgreSQL.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🐳 Docker Setup](#-docker-setup)
  - [Services](#services)
  - [Quick Start with Docker](#quick-start-with-docker)
  - [Docker Commands](#docker-commands)
  - [Environment Variables for Docker](#environment-variables-for-docker)
  - [Health Check](#health-check)
  - [Development vs Production](#development-vs-production)
- [Testing](#testing)
  - [Test Setup](#test-setup)
- [API Versioning](#api-versioning)
  - [Features](#features-1)
  - [Configuration](#configuration)
  - [API Prefix Options](#api-prefix-options)
  - [Available Routes](#available-routes)
  - [Response Headers](#response-headers)
  - [Adding New Versions](#adding-new-versions)
  - [Deprecation Warnings](#deprecation-warnings)
  - [Version Utilities](#version-utilities)
- [Router Configuration](#router-configuration)
  - [File Structure](#file-structure)
  - [Router Features](#router-features)
  - [Adding New API Versions](#adding-new-api-versions)
  - [Custom Route Setup](#custom-route-setup)
  - [Router Functions](#router-functions)
  - [Development Routes](#development-routes)
- [API Testing Examples](#api-testing-examples)
  - [Quick Health Check](#quick-health-check)
  - [Version Information](#version-information)
  - [Development Testing](#development-testing)
  - [Authentication Examples](#authentication-examples)
  - [API Prefix Testing](#api-prefix-testing)
  - [Headers Testing](#headers-testing)
- [API Endpoints](#api-endpoints)
  - [Version Information](#version-information-1)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Development Endpoints](#development-endpoints-development-only)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Development](#development)
  - [Development Server Options](#development-server-options)
  - [File Watching](#file-watching)
  - [Environment Variables](#environment-variables-1)
- [Server Startup Information](#server-startup-information)
  - [Startup Console Output](#startup-console-output)
  - [Features](#features-2)
- [Database Setup](#database-setup)
  - [Initial Setup](#initial-setup)
  - [Demo Users](#demo-users)
  - [Sequelize v6 Specifics](#sequelize-v6-specifics)
- [Troubleshooting](#troubleshooting)
  - [Deprecation Warnings](#deprecation-warnings-1)
  - [ESLint Configuration](#eslint-configuration)
- [Testing](#testing-1)
- [Deployment](#deployment)
  - [Manual Deployment](#manual-deployment)
- [Contributing](#contributing)
- [License](#license)
- [Security](#security)
- [Support](#support)
- [📝 TODO](#-todo)

## Features

- **Node.js 20.x** - Latest LTS version
- **Express.js** - Fast, unopinionated web framework
- **PostgreSQL** - Reliable relational database
- **Sequelize v6** - Stable ORM with migrations and seeders
- **JWT Authentication** - Secure token-based authentication
- **Email Service** - Nodemailer for email verification and password reset
- **API Versioning** - Flexible API versioning with middleware support
- **SWC** - Fast TypeScript/JavaScript compiler for building
- **Docker** - Containerized development and deployment
- **ESLint v9** - Modern code linting with flat config
- **Mocha v11 + Chai v5** - Latest testing framework
- **Morgan** - HTTP request logger middleware
- **Compression** - Response compression middleware
- **Security** - Helmet, CORS, and rate limiting
- **Validation** - Express-validator for input validation

## Project Structure

```
├── src/                    # Source code
│   ├── bin/                # Application entry point
│   │   └── www.js
│   ├── config/             # Configuration files
│   │   ├── config.js
│   │   ├── database.js
│   │   ├── router.js
│   │   └── router.example.js
│   ├── controllers/        # Route controllers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── database/           # Database related files
│   │   ├── migrations/
│   │   ├── models/
│   │   │   ├── index.js
│   │   │   └── User.js
│   │   └── seeders/
│   ├── helpers/            # Helper functions
│   │   ├── emailService.js
│   │   └── tokenGenerator.js
│   ├── middlewares/        # Custom middlewares
│   │   ├── apiVersion.js
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validation.js
│   ├── routes/             # API routes
│   │   ├── validations/
│   │   │   └── auth.js
│   │   ├── auth.js
│   │   └── users.js
│   ├── utils/              # Utility functions
│   │   └── apiVersion.js
│   └── app.js              # Express application
├── test/                   # Test files
│   └── auth.test.js
├── docker-compose.yml      # Docker compose configuration
├── Dockerfile              # Docker configuration
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 12 or higher
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd node-express-pg-starter
```

2. Clean install dependencies (recommended):
```bash
npm run setup
```

**Or** install normally:
```bash
npm install
```

> **Note**: If you see deprecation warnings during installation, run `npm run setup` to do a clean install with the latest package versions.

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`.

## 🐳 Docker Setup

This project includes a complete Docker setup for containerized development and deployment.

### Services

- **App**: Node.js application running on port 3000
- **PostgreSQL**: Database running on port 5433 (to avoid conflicts with host PostgreSQL)

### Quick Start with Docker

```bash
# Start all services in detached mode
sudo docker compose up -d

# Check status
sudo docker compose ps

# View logs
sudo docker compose logs app
sudo docker compose logs postgres

# Stop all services
sudo docker compose down
```

### Docker Commands

```bash
# Build Docker image
sudo docker compose build

# Start services with build
sudo docker compose up --build -d

# Stop and remove volumes (clean restart)
sudo docker compose down -v

# Access running container
sudo docker exec -it node-express-pg-starter-app-1 sh
```

### Environment Variables for Docker

The Docker setup uses the following environment variables (configured in `docker-compose.yml`):

```yaml
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=node_express_pg_starter
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DIALECT=postgres
JWT_SECRET=your_production_jwt_secret_here
```

### Health Check

Test if the containerized application is running:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"...","environment":"production","apiVersion":"v1","supportedVersions":["v1"],"apiPrefix":"none"}
```

### Development vs Production

**Development**: Use `npm run dev` for local development with hot reload and debugging.

**Production**: Use Docker for production deployment with optimized builds and security.

## Testing

> **⚠️ Important**: Before running tests, you must set up the test environment properly.

### Test Setup

1. **Set NODE_ENV to test**:
```bash
export NODE_ENV=test
```

2. **Set up test database**:
```bash
npm run test:setup
```

3. **Run tests**:
```bash
npm test
```

For detailed testing instructions, see [TEST_GUIDE.md](./TEST_GUIDE.md).

## API Versioning

This boilerplate includes comprehensive API versioning support that's ready for production use.

### Features

- **Flexible Versioning**: Support for path-based versioning (e.g., `/v1/users`)
- **Backward Compatibility**: Routes work both with and without version prefixes
- **Version Validation**: Automatic validation of supported API versions
- **Response Headers**: Automatic version headers in all responses
- **Deprecation Support**: Built-in middleware for deprecation warnings
- **No `/api` Prefix**: Designed for subdomain-based APIs (e.g., `api.yourapp.com`)

### Configuration

Add to your `.env` file:

```env
# API Configuration
API_VERSION=v1                # Current API version
API_PREFIX_ENABLED=false      # Enable/disable API prefix (for subdomain usage)
```

### API Prefix Options

The boilerplate supports two routing modes:

1. **Subdomain Mode** (Recommended): `API_PREFIX_ENABLED=false`
   ```
   api.yourapp.com/v1/auth/login
   api.yourapp.com/v1/users/profile
   ```

2. **Path-based Mode**: `API_PREFIX_ENABLED=true`
   ```
   yourapp.com/api/v1/auth/login
   yourapp.com/api/v1/users/profile
   ```

### Available Routes

The API supports both versioned and non-versioned endpoints:

**With API Prefix Enabled (`API_PREFIX_ENABLED=true`):**
```bash
# Versioned routes (recommended)
GET /api/v1/auth/login
GET /api/v1/users/profile
POST /api/v1/auth/register

# Backward compatibility (without version)
GET /api/auth/login
GET /api/users/profile
POST /api/auth/register

# Version info endpoints (always at root)
GET /health    # Includes API version information  
GET /version   # Detailed version information
```

**With API Prefix Disabled (`API_PREFIX_ENABLED=false`):**
```bash
# Versioned routes (recommended)
GET /v1/auth/login
GET /v1/users/profile
POST /v1/auth/register

# Backward compatibility (without version)
GET /auth/login
GET /users/profile
POST /auth/register

# Version info endpoints (always at root)
GET /health    # Includes API version information
GET /version   # Detailed version information
```

### Response Headers

All API responses include version information:

```http
X-API-Version: v1
X-API-Supported-Versions: v1
```

### Adding New Versions

To add a new API version (e.g., v2):

1. **Update supported versions** in `src/app.js`:
```javascript
app.use(validateApiVersion(['v1', 'v2']))
```

2. **Create versioned routes**:
```javascript
app.use(`/v2/auth`, authV2Routes)
app.use(`/v2/users`, userV2Routes)
```

3. **Update version headers** in `src/middlewares/apiVersion.js`:
```javascript
'X-API-Supported-Versions': 'v1,v2'
```

### Deprecation Warnings

Mark old versions as deprecated:

```javascript
const { deprecationWarning } = require('./middlewares/apiVersion')

// Add deprecation warning for v1
app.use(deprecationWarning('v1', '2024-12-31', 'API v1 will be removed'))
```

Response will include deprecation headers:
```http
Deprecation: true
Sunset: 2024-12-31
X-Deprecation-Warning: API v1 will be removed
```

### Version Utilities

The `src/utils/apiVersion.js` provides helpful utilities:

```javascript
const { getCurrentVersion, createVersionedPath, isVersion } = require('./utils/apiVersion')

// Get current API version
const version = getCurrentVersion() // 'v1'

// Create versioned paths
const path = createVersionedPath('/users') // '/v1/users'

// Check request version
const isV1 = isVersion(req, 'v1') // true/false
```

## Router Configuration

The boilerplate now uses a clean, modular router configuration system that separates routing logic from the main application file.

### File Structure

- **`src/config/router.js`** - Main router configuration
- **`src/config/router.example.js`** - Examples for extending routes
- **`src/app.js`** - Clean application setup (no route definitions)

### Router Features

- **Modular Setup**: Routes are organized in logical functions
- **Order Management**: Ensures middleware and routes are applied in correct order
- **Version Management**: Easy addition of new API versions
- **Error Handling**: Centralized error handling setup
- **Extensibility**: Simple pattern for adding custom routes

### Adding New API Versions

To add a new API version (e.g., v2):

1. **Update supported versions** in `src/config/router.js`:
```javascript
const getSupportedVersions = () => {
  return ['v1', 'v2'] // Add v2
}

const setupVersioningMiddleware = (app) => {
  app.use(validateApiVersion(['v1', 'v2'])) // Add v2
  app.use(addVersionHeaders())
}
```

2. **Create v2 routes**:
```bash
mkdir src/routes/v2
# Create your v2 route files
```

3. **Use the router helper**:
```javascript
const { addNewVersion } = require('./config/router')
const authV2Routes = require('./routes/v2/auth')
const userV2Routes = require('./routes/v2/users')

// Add in app.js after setupRoutes(app)
addNewVersion('v2', {
  auth: authV2Routes,
  users: userV2Routes
}, app)
```

### Custom Route Setup

For environment-specific or custom routes:

```javascript
// In your main app setup
const { setupRoutes } = require('./config/router')
const { setupCustomRoutes } = require('./config/router.example')

setupRoutes(app)        // Main API routes
setupCustomRoutes(app)  // Additional custom routes
```

### Router Functions

| Function | Description |
|----------|-------------|
| `setupRoutes(app)` | Complete route setup (recommended) |
| `setupVersioningMiddleware(app)` | API versioning middleware only |
| `setupUtilityRoutes(app)` | Health and version endpoints |
| `setupDevelopmentRoutes(app)` | Development-only routes and utilities |
| `setupVersionedRoutes(app)` | Versioned API routes |
| `setupBackwardCompatibilityRoutes(app)` | Non-versioned routes |
| `setupErrorHandling(app)` | Error handling middleware |
| `addNewVersion(version, routes, app)` | Add new API version |
| `getSupportedVersions()` | Get array of supported versions |
| `getApiPrefix()` | Get current API prefix setting |

### Development Routes

The boilerplate includes built-in development routes that are automatically enabled when `NODE_ENV=development`.

**Available Development Endpoints:**

1. **Development Test** (always at root):
   - `GET /dev/test` - Basic development endpoint test
   - Returns: Environment info, API config, timestamp

2. **Development Info** (respects API prefix):
   - If `API_PREFIX_ENABLED=false`: `GET /dev/info`
   - If `API_PREFIX_ENABLED=true`: `GET /api/dev/info`
   - Returns: Detailed server configuration and environment info

**Example Responses:**

```bash
# Test endpoint
curl http://localhost:3000/dev/test
{
  "message": "Development test endpoint - working!",
  "environment": "development",
  "apiPrefix": "none",
  "apiVersion": "v1",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "note": "This endpoint is always at root level"
}

# Info endpoint
curl http://localhost:3000/dev/info
{
  "message": "Development info endpoint - working!",
  "environment": "development",
  "currentPrefix": "none",
  "fullPath": "/dev/info",
  "apiVersion": "v1",
  "serverConfig": {
    "prefixEnabled": false,
    "nodeEnv": "development",
    "port": 3000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Features:**
- ✅ **Auto-registration** - No manual setup required
- ✅ **Environment-aware** - Only available in development
- ✅ **Prefix-aware** - Respects API prefix configuration
- ✅ **Informative responses** - Detailed server and config info
- ✅ **Console logging** - Registration status shown on startup

## API Testing Examples

### Quick Health Check

```bash
# Test if API is running
curl http://localhost:3000/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "apiVersion": "v1",
  "supportedVersions": ["v1"],
  "apiPrefix": "none"
}
```

### Version Information

```bash
# Get detailed version info
curl http://localhost:3000/version

# Expected response:
{
  "currentVersion": "v1",
  "requestedVersion": "v1",
  "supportedVersions": ["v1"],
  "apiPrefix": "none",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Development Testing

```bash
# Test basic development endpoint
curl http://localhost:3000/dev/test

# Test development info (prefix-aware)
curl http://localhost:3000/dev/info
# or if API_PREFIX_ENABLED=true:
curl http://localhost:3000/api/dev/info
```

### Authentication Examples

```bash
# Register new user (versioned - recommended)
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login (backward compatibility)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### API Prefix Testing

**With Prefix Disabled** (`API_PREFIX_ENABLED=false`):
```bash
curl http://localhost:3000/v1/users/profile
curl http://localhost:3000/auth/login
```

**With Prefix Enabled** (`API_PREFIX_ENABLED=true`):
```bash
curl http://localhost:3000/api/v1/users/profile
curl http://localhost:3000/api/auth/login
```

### Headers Testing

All API responses include version headers:

```bash
# Check response headers
curl -I http://localhost:3000/health

# Expected headers include:
# X-API-Version: v1
# X-API-Supported-Versions: v1
```

## API Endpoints

### Version Information

- `GET /health` - Health check endpoint with API version info
- `GET /version` - Detailed API version information

*Note: Health and version endpoints are always available at root level, regardless of API prefix setting.*

### Authentication

**With API Prefix Enabled (`API_PREFIX_ENABLED=true`):**

*Versioned (Recommended):*
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password (authenticated)
- `POST /api/v1/auth/resend-verification` - Resend verification email (authenticated)

*Backward Compatibility:*
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/resend-verification` - Resend verification email (authenticated)

**With API Prefix Disabled (`API_PREFIX_ENABLED=false`):**

*Versioned (Recommended):*
- `POST /v1/auth/register` - Register a new user
- `POST /v1/auth/login` - Login user
- `POST /v1/auth/verify-email` - Verify email address
- `POST /v1/auth/forgot-password` - Request password reset
- `POST /v1/auth/reset-password` - Reset password
- `POST /v1/auth/change-password` - Change password (authenticated)
- `POST /v1/auth/resend-verification` - Resend verification email (authenticated)

*Backward Compatibility:*
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/verify-email` - Verify email address
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/change-password` - Change password (authenticated)
- `POST /auth/resend-verification` - Resend verification email (authenticated)

### Users

**With API Prefix Enabled (`API_PREFIX_ENABLED=true`):**

*Versioned (Recommended):*
- `GET /api/v1/users/profile` - Get user profile (authenticated)
- `PUT /api/v1/users/profile` - Update user profile (authenticated)
- `DELETE /api/v1/users/account` - Deactivate account (authenticated)
- `GET /api/v1/users` - Get all users (authenticated)

*Backward Compatibility:*
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `DELETE /api/users/account` - Deactivate account (authenticated)
- `GET /api/users` - Get all users (authenticated)

**With API Prefix Disabled (`API_PREFIX_ENABLED=false`):**

*Versioned (Recommended):*
- `GET /v1/users/profile` - Get user profile (authenticated)
- `PUT /v1/users/profile` - Update user profile (authenticated)
- `DELETE /v1/users/account` - Deactivate account (authenticated)
- `GET /v1/users` - Get all users (authenticated)

*Backward Compatibility:*
- `GET /users/profile` - Get user profile (authenticated)
- `PUT /users/profile` - Update user profile (authenticated)
- `DELETE /users/account` - Deactivate account (authenticated)
- `GET /users` - Get all users (authenticated)

### Development Endpoints (Development Only)

*Note: These endpoints are only available when `NODE_ENV=development`*

**Always Available (No Prefix):**
- `GET /dev/test` - Development test endpoint with config info

**Prefix-Aware Endpoints:**

*With API Prefix Enabled (`API_PREFIX_ENABLED=true`):*
- `GET /api/dev/info` - Detailed development info endpoint

*With API Prefix Disabled (`API_PREFIX_ENABLED=false`):*
- `GET /dev/info` - Detailed development info endpoint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/test/production) | development |
| `PORT` | Server port | 3000 |
| `HOST` | Server host | localhost |
| `API_VERSION` | Current API version | v1 |
| `API_PREFIX_ENABLED` | Enable/disable API prefix for subdomain usage | false |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | node_express_pg_starter |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | password |
| `DB_DIALECT` | Database type (postgres/mysql/sqlite/mssql) | postgres |
| `JWT_SECRET` | JWT secret key | your_jwt_secret_key_here |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `MAIL_HOST` | Email SMTP host | smtp.gmail.com |
| `MAIL_PORT` | Email SMTP port | 587 |
| `MAIL_USERNAME` | Email username | - |
| `MAIL_PASSWORD` | Email password | - |
| `MAIL_FROM` | Email from address | noreply@yourapp.com |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | 100 |
| `FRONTEND_URL` | Frontend URL for email links | http://localhost:3000 |

## Scripts

- `npm run setup` - Clean install all dependencies (recommended)
- `npm run clean` - Remove node_modules and package-lock.json
- `npm run dev` - **Start development server with auto-restart (nodemon + SWC)**
- `npm run dev:swc` - Start development server without auto-restart (SWC only)
- `npm run dev:inspect` - Start development server with debugger support
- `npm start` - Start production server
- `npm run build` - Build application with SWC
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run db:create` - Create database
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Run database seeders
- `npm run db:seed:undo` - Undo database seeders

## Development

### Development Server Options

1. **Recommended**: Auto-restart with file watching
```bash
npm run dev
```
This uses **nodemon + SWC** for the best development experience:
- ✅ Auto-restart when files change
- ✅ Fast compilation with SWC
- ✅ Watches only `src/` directory
- ✅ Colorful output with restart notifications

2. **Simple**: One-time run without watching
```bash
npm run dev:swc
```

3. **Debugging**: With Chrome DevTools support
```bash
npm run dev:inspect
```
Then open Chrome and go to `chrome://inspect` to debug your application.

### File Watching

The development server watches for changes in:
- All `.js` files in `src/` directory
- All `.json` files in `src/` directory
- Ignores test files, node_modules, and build output

### Environment Variables

Create your `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` with your specific configuration.

## Server Startup Information

When you start the development server, you'll see detailed information about your API configuration and available endpoints.

### Startup Console Output

The server provides comprehensive startup information including:

```bash
🚀 ===== SERVER STARTED SUCCESSFULLY ===== 🚀
📍 Server URL: http://localhost:3000
📝 Environment: development
✌️  API Version: v1
💪 API Prefix: DISABLED (no prefix)

⚙️  ===== CONFIGURATION SUMMARY ===== ⚙️
   Port: 3000
   Host: localhost
   Node Environment: development
   API Version: v1
   API Prefix Enabled: false
   Frontend URL: http://localhost:3000

📋 ===== AVAILABLE ENDPOINTS ===== 📋

🏥 Health & Info:
   GET http://localhost:3000/health
   GET http://localhost:3000/version

🔗 API Endpoints (no prefix):
   📌 Versioned Routes (Recommended):
      POST http://localhost:3000/v1/auth/login
      POST http://localhost:3000/v1/auth/register
      GET  http://localhost:3000/v1/users/profile
   📌 Backward Compatibility:
      POST http://localhost:3000/auth/login
      POST http://localhost:3000/auth/register
      GET  http://localhost:3000/users/profile

💡 TIP: Your API is configured for subdomain-style routing.
   In production, use: api.yourapp.com instead of yourapp.com/api

🎯 ===== QUICK TEST COMMANDS ===== 🎯
curl http://localhost:3000/health
curl http://localhost:3000/version

🛠️  ===== DEVELOPMENT MODE ===== 🛠️
   Auto-restart: ✅ Enabled
   File watching: src/**/*.js

🧪 Development Endpoints:
   GET http://localhost:3000/dev/test
   GET http://localhost:3000/dev/info

🧪 Development routes registered:
   ✅ GET /dev/test
   ✅ GET /dev/info

==================================================
```

### Features

- **📍 Complete URLs** - Ready-to-copy endpoint URLs
- **⚙️ Configuration Summary** - Current server settings at a glance  
- **🔗 Route Overview** - All available endpoints organized by type
- **💡 Smart Tips** - Context-aware suggestions based on your config
- **🎯 Quick Tests** - Copy-paste curl commands for immediate testing
- **🛠️ Development Info** - Development-specific features and routes
- **🧪 Route Registration** - Confirmation of successfully registered routes

This makes it easy to understand your API structure and start testing immediately after server startup.

## Database Setup

This project uses **Sequelize v6** (stable version) with PostgreSQL.

### Initial Setup

1. **Create database**:
```bash
npm run db:create
```

2. **Run migrations**:
```bash
npm run db:migrate
```

3. **Seed demo data** (optional):
```bash
npm run db:seed
```

### Demo Users

After seeding, you can login with:
- **Admin**: `admin@example.com` / `password123`
- **User**: `user@example.com` / `password123`

### Sequelize v6 Specifics

This boilerplate uses Sequelize v6 (not v7 alpha) for stability. Key features:

- ✅ **UUID v4** primary keys
- ✅ **Proper operators** import (`Op.gt`, `Op.in`, etc.)
- ✅ **Async/await** syntax throughout
- ✅ **Auto-timestamps** (createdAt, updatedAt)
- ✅ **Indexes** for performance
- ✅ **Hooks** for password hashing

**Note**: If you prefer Sequelize v7, update package.json and check for any breaking changes in the migration guide.

## Troubleshooting

### Deprecation Warnings

If you encounter deprecation warnings during installation:

```bash
npm warn deprecated inflight@1.0.6: This module is not supported...
npm warn deprecated glob@8.1.0: Glob versions prior to v9 are no longer supported
```

**Solution**: Run a clean install:
```bash
npm run setup
```

This will remove old cached packages and install the latest versions.

### ESLint Configuration

This project uses ESLint v9 with the new flat config format. The configuration file is `eslint.config.js` (not `.eslintrc.js`).

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "Authentication"
```

## Deployment

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Run database migrations:
```bash
NODE_ENV=production npm run db:migrate
```

4. Start the application:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

For security concerns, please email ikhwanulabiyu@gmail.com instead of using the issue tracker.

## Support

If you have any questions or need help, please open an issue on GitHub.

## 📝 TODO

### 🚀 Features to Implement

- [ ] **GitHub Actions CI/CD Pipeline**
  - [ ] Automated testing with PostgreSQL service
  - [ ] Docker build and push
  - [ ] Security scanning (npm audit + Snyk)
  - [ ] Deployment automation

- [ ] **API Features**
  - [ ] Rate limiting configuration
  - [ ] API documentation (Swagger/OpenAPI)
  - [ ] Request/response logging
  - [ ] API metrics and monitoring

- [ ] **Database**
  - [ ] Database connection pooling optimization
  - [ ] Database backup strategies
  - [ ] Performance monitoring

- [ ] **Security**
  - [ ] Two-factor authentication (2FA)
  - [ ] OAuth integration (Google, GitHub, etc.)
  - [ ] API key management
  - [ ] Security headers optimization

- [ ] **Testing**
  - [ ] Integration test improvements
  - [ ] Performance testing
  - [ ] Test coverage reporting
  - [ ] E2E testing with Playwright/Cypress

- [ ] **DevOps**
  - [ ] Kubernetes deployment configurations
  - [ ] Environment-specific configurations
  - [ ] Health check improvements
  - [ ] Logging aggregation (ELK stack)

- [ ] **Developer Experience**
  - [ ] Hot reload improvements
  - [ ] Debugging tools
  - [ ] Code generation scripts
  - [ ] Development utilities