# Pizza 42 - Auth0 Enhanced

A modern pizza ordering application built with React, Redux Toolkit, and Auth0 authentication, deployed on Vercel with serverless functions and Postgres database.

## Features

### Core Functionality
- Browse pizza menu with real-time data
- Add items to cart with Redux state management
- User authentication with Auth0 (login/logout)
- Place and track orders
- View order history (stored in Vercel Postgres)
- Update existing orders (priority upgrade)
- Geolocation for automatic address filling
- Priority order upgrades (20% surcharge)

### Auth0 Integration
- **Email Verification Flow** - Users must verify email before placing orders
- **User Metadata Storage** - Order history saved to Auth0 user_metadata
- **Subscription Management** - Premium/Standard tier system stored in app_metadata
- **Profile Management** - View and update user profile information
- **Token Refresh** - Manual token refresh with Auth0 SDK
- **Custom Claims** - Email and subscription exposed via custom namespace

### User Experience
- **Toast Notifications** - Real-time feedback for all user actions
- **Responsive Design** - Mobile-first TailwindCSS styling
- **Order Persistence** - Cart and form data preserved during verification flow
- **Loading States** - User feedback during async operations

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management (cart, user, toast)
- **React Router v6** - Routing with loaders and actions
- **TailwindCSS** - Utility-first CSS framework
- **Auth0 React SDK** - Authentication and token management

### Backend
- **Vercel Serverless Functions** - API routes (Node.js)
- **Vercel Postgres (Neon)** - PostgreSQL database
- **Auth0 Management API** - User management and email verification
- **Express OAuth2 JWT Bearer** - JWT token validation
- **Express** - Middleware and routing (local dev server)

### Database Schema
- **users** - Auth0 user records with email and names
- **orders** - Order data stored as JSONB
- **pizzas** - Menu items with pricing and ingredients

## Project Structure

```
├── api/                      # Vercel Serverless Functions
│   ├── orders/
│   │   ├── index.js         # GET/POST orders
│   │   └── [orderId].js     # GET/PATCH specific order
│   ├── user/
│   │   ├── profile.js       # GET/PATCH user profile
│   │   ├── subscription.js  # PATCH subscription tier
│   │   └── metadata.js      # GET user metadata
│   └── menu.js              # GET pizza menu
├── backend/                  # Shared backend code
│   ├── lib/
│   │   ├── auth0.js         # Token validation utilities
│   │   ├── db.js            # Database queries (Vercel Postgres)
│   │   └── management-api.js # Auth0 Management API client
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   ├── cors.js          # CORS configuration
│   │   └── error-handler.js # Async error handling
│   └── schema.sql           # Database schema
├── src/                      # Frontend React app
│   ├── features/
│   │   ├── auth/            # Login, Profile, UserProfile dropdown
│   │   ├── cart/            # Cart functionality
│   │   ├── menu/            # Pizza menu
│   │   ├── order/           # Order creation and tracking
│   │   ├── toast/           # Toast notification system
│   │   └── user/            # User state (Redux)
│   ├── services/
│   │   ├── apiRestaurant.js # API client for orders/menu
│   │   └── auth.js          # Auth0 token utilities
│   ├── ui/                  # Reusable components
│   ├── utils/               # Helper functions
│   └── config/
│       └── auth0-config.js  # Auth0 configuration
├── server.js                 # Local development API server
└── vercel.json              # Vercel deployment config
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Auth0 account (free tier works)
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

Edit `.env.local` with your credentials:
```env
# Auth0 Frontend (React)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://pizza42.com/api

# Auth0 Backend (API)
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_AUDIENCE=https://pizza42.com/api

# Auth0 Management API
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-m2m-client-id
AUTH0_CLIENT_SECRET=your-m2m-client-secret

# Database
DATABASE_URL=your-postgres-connection-string
```

### Auth0 Setup

#### 1. Create Single Page Application (SPA)
1. Go to Auth0 Dashboard → Applications → Create Application
2. Choose "Single Page Application"
3. Configure settings:
   - **Allowed Callback URLs**:
     - `http://localhost:5173/callback`
     - `https://your-domain.vercel.app/callback`
   - **Allowed Logout URLs**:
     - `http://localhost:5173`
     - `https://your-domain.vercel.app`
   - **Allowed Web Origins**:
     - `http://localhost:5173`
     - `https://your-domain.vercel.app`
4. Copy the **Domain** and **Client ID** to `.env.local` as `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID`

#### 2. Create API
1. Go to Auth0 Dashboard → APIs → Create API
2. Settings:
   - **Name**: Pizza42 API
   - **Identifier**: `https://pizza42.com/api`
   - **Signing Algorithm**: RS256
3. Enable **Offline Access** (for refresh tokens)
4. Copy the **Identifier** to `.env.local` as `VITE_AUTH0_AUDIENCE` and `AUTH0_AUDIENCE`

#### 3. Create Machine-to-Machine (M2M) Application
1. Go to Auth0 Dashboard → Applications → Create Application
2. Choose "Machine to Machine Application"
3. Authorize it for the **Auth0 Management API**
4. Grant permissions:
   - `read:users`
   - `update:users`
   - `update:users_app_metadata`
   - `read:users_app_metadata`
   - `create:user_tickets` (for verification emails)
5. Copy **Client ID** and **Client Secret** to `.env.local` as `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET`

#### 4. Configure Actions (Add Custom Claims)
1. Go to Auth0 Dashboard → Actions → Library → Build Custom
2. Create new action:
```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://pizza42.com';

  if (event.authorization) {
    // Add email to ID token
    api.idToken.setCustomClaim(`${namespace}/email`, event.user.email);
    api.idToken.setCustomClaim(`${namespace}/email_verified`, event.user.email_verified);

    // Add subscription to both tokens
    const subscription = event.user.app_metadata?.subscription || 'standard';
    api.idToken.setCustomClaim(`${namespace}/subscription`, subscription);
    api.accessToken.setCustomClaim(`${namespace}/subscription`, subscription);
  }
};
```
3. Deploy the action
4. Go to Actions → Flows → Login → Add to flow

### Database Setup

1. Create a Vercel Postgres database:
```bash
vercel link  # Link to your project
vercel postgres create pizza42-db
```

2. Get the connection string:
```bash
vercel env pull .env.local
```

3. Run the schema:
```bash
psql $DATABASE_URL -f backend/schema.sql
```

Or use Vercel's SQL editor in the dashboard.

4. Seed the pizza menu (optional):
```bash
npm run db:seed
```

### Development

1. Start the frontend (Vite):
```bash
npm run dev
```

2. In a separate terminal, start the API server:
```bash
npm run dev:api
```

This will run:
- **Frontend**: `http://localhost:5173`
- **API server**: `http://localhost:3001/api/*`

The API server (`server.js`) mimics Vercel's serverless routing for local development.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Make sure to set them for **Production**, **Preview**, and **Development**

4. Deploy:
```bash
vercel --prod
```

5. Update Auth0 callback URLs:
   - Add your Vercel URL to Allowed Callback URLs
   - Add to Allowed Logout URLs
   - Add to Allowed Web Origins

## API Endpoints

### Public
- `GET /api/menu` - Fetch pizza menu from database

### Protected (Requires Auth0 Bearer token)
- `GET /api/orders` - Get user's order history
- `POST /api/orders` - Create new order (requires verified email)
- `GET /api/orders/:orderId` - Get specific order details
- `PATCH /api/orders/:orderId` - Update order (add priority)
- `GET /api/user/profile` - Get user profile from database
- `PATCH /api/user/profile` - Update user profile (name, address)
- `PATCH /api/user/subscription` - Update subscription tier (premium/standard)
- `GET /api/user/metadata` - Get Auth0 user_metadata

## Authentication Flow

1. User clicks "Login" → Auth0 SDK redirects to Auth0 Universal Login
2. User authenticates → Auth0 redirects back with authorization code
3. Auth0 SDK exchanges code for tokens (ID token, Access token)
4. Tokens stored in memory by Auth0 SDK
5. Frontend includes `Authorization: Bearer {access_token}` in API requests
6. Backend validates JWT using Auth0 public keys
7. User record created/fetched from Postgres database
8. Custom claims (email, subscription) available in tokens

## Email Verification Flow

1. User attempts to place order without verified email
2. Backend checks `email_verified` status via Auth0 Management API
3. If not verified:
   - Sends verification email via Auth0 Jobs API
   - Returns 403 error with `requiresEmailVerification: true`
4. Frontend shows verification message and "Confirm Email Verification" button
5. User clicks email link → Auth0 verifies email
6. User clicks confirmation button → Frontend checks `user.email_verified` from Auth0 SDK
7. If verified, order button is re-enabled (cart preserved)
8. User can complete order

## Toast Notification System

Toast notifications provide user feedback across the app:
- **Success** - Order created, email verified, profile updated
- **Error** - API failures, authentication errors
- **Warning** - Email not yet verified
- **Info** - Loading states, informational messages

Implementation:
- Redux slice (`toastSlice.js`)
- Centralized `ToastContainer` in `AppLayout`
- Customizable duration and types
- Auto-dismiss with animations

## Scripts

- `npm run dev` - Start Vite dev server (port 5173)
- `npm run dev:api` - Start local Express API server (port 3001)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run db:seed` - Seed pizza menu to database
- `vercel` - Deploy to Vercel
- `vercel dev` - Alternative local dev (uses Vercel CLI)

## Environment Variables

### Frontend (VITE_*)
```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://pizza42.com/api
```

### Backend API Validation
```env
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_AUDIENCE=https://pizza42.com/api
```

### Auth0 Management API
```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-m2m-client-id
AUTH0_CLIENT_SECRET=your-m2m-client-secret
```

### Database
```env
DATABASE_URL=postgres://user:pass@host/db
POSTGRES_URL=postgres://user:pass@host/db  # Vercel sets both
```

## Troubleshooting

### "Email not verified" error
- Check that user clicked the verification link in email
- Try refreshing the token on the Profile page
- Verify the M2M app has `create:user_tickets` permission

### Orders not appearing
- Check Vercel Postgres is connected
- Verify `DATABASE_URL` is set correctly
- Check Vercel Function logs for errors

### Authentication errors
- Verify Auth0 callback URLs match exactly
- Check that API identifier matches in all configs
- Ensure custom claims Action is deployed and added to Login flow

### Local development API errors
- Make sure both `npm run dev` and `npm run dev:api` are running
- Check that ports 5173 and 3001 are available
- Verify `.env.local` has all required variables

## Future Enhancements

- [ ] Persistent cart in localStorage/database
- [ ] Push notifications for order status updates
- [ ] Favorite orders and quick reorder
- [ ] Loyalty points/rewards system
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard for order management
- [ ] Real-time order tracking with websockets
- [ ] Email receipts and order confirmations
- [ ] Order scheduling for future delivery
- [ ] Multiple delivery addresses per user

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## License

MIT

## Acknowledgments

- Original project inspired by Jonas Schmedtmann's React course
- Enhanced with Auth0, Vercel serverless architecture, and modern UX patterns
- Toast notification design inspired by popular notification libraries
