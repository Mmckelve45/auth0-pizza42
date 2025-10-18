# Pizza 42 - Auth0 Enhanced

A modern pizza ordering application built with React, Redux Toolkit, and Auth0 authentication, deployed on Vercel.

## Features

- Browse pizza menu
- Add items to cart with Redux state management
- User authentication with Auth0
- Place and track orders
- View order history
- User profile and preferences
- Geolocation for automatic address filling
- Priority order upgrades

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v6** - Routing with data loaders
- **TailwindCSS** - Styling
- **Auth0 React SDK** - Authentication

### Backend
- **Vercel Serverless Functions** - API routes
- **Vercel Postgres** - Database
- **Auth0** - Authentication & authorization
- **Express OAuth2 JWT Bearer** - JWT validation

## Project Structure

```
├── api/                      # Vercel Serverless Functions
│   ├── auth/                # Auth0 handlers
│   ├── orders/              # Order endpoints
│   ├── user/                # User profile endpoints
│   └── menu.js              # Menu endpoint
├── backend/                  # Shared backend code
│   ├── lib/                 # Utilities (auth0, db, api clients)
│   ├── middleware/          # Express middleware
│   ├── models/              # Data models
│   └── schema.sql           # Database schema
├── src/                      # Frontend React app
│   ├── features/            # Feature-based modules
│   ├── services/            # API clients
│   ├── ui/                  # Reusable components
│   └── utils/               # Helper functions
└── .claude/                  # Project documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Auth0 account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd auth0
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Auth0 credentials:
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
DATABASE_URL=your-postgres-connection-string
```

### Auth0 Setup

1. Create an Auth0 application (Single Page Application)
2. Configure callback URLs:
   - `http://localhost:5173/callback`
   - `https://your-domain.vercel.app/callback`
3. Configure logout URLs:
   - `http://localhost:5173`
   - `https://your-domain.vercel.app`
4. Create an API in Auth0 for backend authorization
5. Copy the domain, client ID, and audience to your `.env.local`

### Database Setup

1. Create a Vercel Postgres database
2. Run the schema:
```bash
psql $DATABASE_URL -f backend/schema.sql
```

Or use Vercel's SQL editor to paste the contents of `backend/schema.sql`

### Development

Start the development server:
```bash
npm run dev
```

For local testing of serverless functions:
```bash
vercel dev
```

This will start:
- Frontend: `http://localhost:5173`
- API routes: `http://localhost:3000/api/*`

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`

4. Redeploy after setting environment variables

### Database Migration

Run the schema against your production database:
```bash
psql $PRODUCTION_DATABASE_URL -f backend/schema.sql
```

## API Endpoints

### Public
- `GET /api/menu` - Fetch pizza menu

### Protected (Requires Auth0 token)
- `GET /api/orders` - Get user's order history
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get specific order
- `PATCH /api/orders/:orderId` - Update order (priority)
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile

## Authentication Flow

1. User clicks "Login" → Redirects to Auth0
2. User authenticates → Auth0 redirects back with token
3. Token stored in React app via Auth0 SDK
4. API calls include `Authorization: Bearer {token}` header
5. Backend validates token via Auth0 middleware
6. User data stored/retrieved from database

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `vercel dev` - Local serverless function testing
- `vercel` - Deploy to Vercel

## Future Enhancements

- [ ] MCP server for programmatic pizza ordering
- [ ] Push notifications for order status
- [ ] Favorite orders and reorder functionality
- [ ] Loyalty points system
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard
- [ ] Real-time order tracking

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## License

MIT

## Acknowledgments

- Original project inspired by Jonas Schmedtmann's React course
- Enhanced with Auth0 and serverless architecture
