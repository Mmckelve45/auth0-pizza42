# Account Linking Feature - Implementation Summary

## 🎉 What Was Built

A complete **secure account linking system** for Pizza 42 that allows users to connect multiple authentication methods (Google OAuth, Email/Password, etc.) to a single account.

## 📁 Files Created

### Backend - Account Linking Server (`/account-linking`)
```
account-linking/
├── server.js                      # Express server with session management
├── package.json                   # Dependencies
├── routes/
│   ├── detect.js                 # Find duplicate accounts by email
│   ├── initiate.js               # Start linking flow with continuation token
│   ├── callback.js               # Handle re-authentication callback
│   └── link.js                   # Execute/unlink via Management API
└── views/
    ├── layout.pug                # Base template with Pizza 42 branding
    ├── link-prompt.pug           # Linking confirmation UI
    ├── link-success.pug          # Success page
    └── error.pug                 # Error handling page
```

### Frontend - React Components (`/src/features/account-linking`)
```
src/features/account-linking/
├── LinkedAccountsBadge.jsx       # Display linked accounts on Profile
└── AccountLinkingDetector.jsx    # Auto-detect duplicates on login
```

### API Integration (`/api/link`)
```
api/link/
└── [...path].js                  # Vercel serverless function wrapper
```

### Database
```
backend/schema.sql
└── account_linking_history table  # Audit trail for all linking events
```

### Backend Helpers
```
backend/lib/management-api.js
└── Added functions:
    - findUsersByEmail()
    - linkAccounts()
    - unlinkAccount()
    - getUserIdentities()
```

### Frontend Integration
```
src/ui/AppLayout.jsx              # Added AccountLinkingDetector
src/features/auth/Profile.jsx     # Added LinkedAccountsBadge
```

### Configuration
```
vercel.json                       # Updated routing for /link/* paths
package.json                      # Added dependencies: express-session, jsonwebtoken, pug
```

### Documentation
```
ACCOUNT_LINKING_SETUP.md          # Complete setup guide
account-linking/README.md         # Technical documentation
.env.account-linking.example      # Example environment variables
```

## 🔐 Security Features

✅ **Email Verification Required** - Only verified emails can be linked
✅ **Re-authentication** - Users must prove ownership of both accounts
✅ **Token Validation** - Backend verifies both primary and secondary tokens
✅ **Continuation Tokens** - Short-lived (5min) JWT tokens with state validation
✅ **CSRF Protection** - State parameter validation in OAuth flow
✅ **Session Security** - httpOnly cookies, secure in production
✅ **Audit Trail** - All linking events logged to database
✅ **Primary Identity Preserved** - Consistent user_id across logins

## 🎯 Key Features

### For Users
- Automatically detect duplicate accounts on login
- Easy linking flow with clear UI
- Link accounts with Google, Email/Password, GitHub, etc.
- View all linked identities in Profile
- Unlink accounts if needed
- Login with any linked method
- Unified order history and profile

### For Developers
- Follows Auth0's recommended server-side pattern
- Production-ready with error handling
- Audit trail in database
- Toast notifications for user feedback
- Responsive UI matching Pizza 42 design
- Works with Vercel serverless deployment

## 🚀 How to Use

### 1. Setup (one-time)
```bash
# See ACCOUNT_LINKING_SETUP.md for detailed instructions

# 1. Create Regular Web App in Auth0
# 2. Add environment variables to .env.local
# 3. Install dependencies
npm install

# 4. Run database migration
psql $DATABASE_URL -f backend/schema.sql
```

### 2. Development
```bash
# Terminal 1 - Frontend + API
npm run dev

# Terminal 2 - Account Linking Server
npm run dev:link

# Or both separately:
# Terminal 1: npm run dev
# Terminal 2: cd account-linking && npm start
```

### 3. Test Flow
1. Create two accounts with same email (one Google, one Email/Password)
2. Log in with either account
3. See yellow popup: "Link your accounts?"
4. Click "Link Accounts" button
5. Re-authenticate with the OTHER login method
6. See success page
7. Check Profile → "Linked Accounts" section
8. Log out and log in with either method
9. Verify unified profile and order history

### 4. Deploy
```bash
# Make sure environment variables are in Vercel Dashboard
vercel --prod

# After deployment, update Auth0 callback URLs to include:
# https://your-domain.vercel.app/link/callback
```

## 📊 User Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ User logs in with Google                        │
│ Email: test@example.com                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ AccountLinkingDetector checks /link/detect      │
│ Query: GET /link/detect?email=test@example.com  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Found 2 accounts with same verified email:      │
│ - auth0|123 (Email/Password)                    │
│ - google-oauth2|456 (Google)                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Show yellow popup: "Link your accounts?"        │
│ [Link Accounts] [Not Now]                       │
└──────────────────┬──────────────────────────────┘
                   │ User clicks "Link"
                   ▼
┌─────────────────────────────────────────────────┐
│ Redirect to /link/initiate                      │
│ Creates continuation token (JWT, 5min)          │
│ Shows prompt with account details               │
└──────────────────┬──────────────────────────────┘
                   │ User clicks "Verify"
                   ▼
┌─────────────────────────────────────────────────┐
│ Redirect to Auth0 with prompt=login             │
│ State = continuation token                      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ User enters Email/Password credentials          │
│ (proving ownership of secondary account)        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Auth0 redirects to /link/callback               │
│ Query: ?code=xxx&state=continuation-token       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Backend validates:                               │
│ 1. Continuation token is valid                  │
│ 2. Session matches                               │
│ 3. Exchanges code for tokens                    │
│ 4. Authenticated user matches secondary ID      │
└──────────────────┬──────────────────────────────┘
                   │ All valid
                   ▼
┌─────────────────────────────────────────────────┐
│ Redirect to /link/complete                      │
│ Call Management API:                             │
│ Link google-oauth2|456 TO auth0|123             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ Save audit log to database                      │
│ Show success page                                │
│ User returns to Pizza 42                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│ ✓ Accounts Linked!                              │
│ User can now login with EITHER method           │
│ Both access same profile and orders             │
└─────────────────────────────────────────────────┘
```

## 🔧 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/link/detect` | GET | Check for duplicate accounts |
| `/link/initiate` | GET | Start linking flow |
| `/link/callback` | GET | Handle Auth0 redirect |
| `/link/complete` | GET | Execute linking |
| `/link/complete/unlink` | POST | Unlink identity |
| `/link/health` | GET | Health check |

## 📦 Dependencies Added

```json
{
  "express-session": "^1.18.0",    // Session management
  "jsonwebtoken": "^9.0.2",        // Continuation tokens
  "pug": "^3.0.2"                  // Template engine
}
```

## 🎨 UI Components

### AccountLinkingDetector
- Automatically checks for duplicates on login
- Shows yellow notification popup
- Dismissible with session storage
- Redirects to linking flow

### LinkedAccountsBadge
- Displays all linked identities
- Shows provider icons (Google, Email, GitHub, etc.)
- Marks primary identity
- Provides unlink functionality
- Expandable list for 3+ accounts

## 🗄️ Database Schema

```sql
CREATE TABLE account_linking_history (
  id SERIAL PRIMARY KEY,
  primary_user_id VARCHAR(255) NOT NULL,
  secondary_user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  action VARCHAR(20) CHECK (action IN ('linked', 'unlinked')),
  linked_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎓 What You'll Learn

This implementation demonstrates:
- ✅ Auth0 Management API integration
- ✅ OAuth2 authorization code flow
- ✅ Server-side session management
- ✅ JWT token creation and validation
- ✅ Secure continuation tokens
- ✅ Express with Vercel serverless functions
- ✅ Pug templating
- ✅ React component composition
- ✅ Database audit logging
- ✅ CSRF protection
- ✅ Security best practices

## 🚨 Important Notes

1. **Separate Auth0 Application Required**
   - Must be "Regular Web Application" (not SPA)
   - Needed for server-side session management
   - Different callback URLs than main SPA

2. **Email Verification Mandatory**
   - Only accounts with `email_verified: true` can be linked
   - This prevents account takeover attacks

3. **Re-authentication is Critical**
   - User must prove ownership of BOTH accounts
   - Can't link based on session alone
   - Uses Auth0's `prompt=login` parameter

4. **Primary vs Secondary Identity**
   - Primary identity is preserved (usually first created)
   - Secondary identities are linked TO the primary
   - Primary user_id is used in all subsequent logins

## 📈 Next Steps

Optional enhancements:
- [ ] Add email notification when accounts are linked
- [ ] Implement rate limiting for security
- [ ] Add Analytics tracking for linking events
- [ ] Create admin dashboard for viewing linking stats
- [ ] Add user preference for auto-linking
- [ ] Implement webhook notifications
- [ ] Add multi-factor authentication requirement for linking
- [ ] Create bulk unlinking functionality

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Users with duplicate accounts see the linking prompt
- ✅ Re-authentication flow completes successfully
- ✅ Linked accounts appear in Profile page
- ✅ Users can log in with either method
- ✅ Order history is unified across linked accounts
- ✅ Audit logs are saved to database
- ✅ Unlinking works from Profile page

## 📚 Resources

- [Auth0 Account Linking Docs](https://auth0.com/docs/manage-users/user-accounts/user-account-linking)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [Express Session Middleware](https://github.com/expressjs/session)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## 🆘 Support

For issues or questions:
1. Check `ACCOUNT_LINKING_SETUP.md` for detailed setup instructions
2. Review Auth0 logs in Dashboard → Monitoring → Logs
3. Check Vercel function logs
4. Review browser console for frontend errors
5. Verify all environment variables are set correctly

---

**Built with:** Express.js, Auth0 Management API, React, Pug, JWT, PostgreSQL

**Author:** Claude Code (with your collaboration!)

**License:** MIT
