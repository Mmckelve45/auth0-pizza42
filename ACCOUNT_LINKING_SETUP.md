# Account Linking Setup Guide

This guide will walk you through setting up secure account linking for the Pizza 42 application using Auth0.

## Overview

The account linking feature allows users who have multiple Pizza 42 accounts with the same email address (e.g., one with Google OAuth and one with email/password) to link them together. This provides a unified user experience where they can log in using any method and access the same profile and order history.

## Architecture

This implementation uses Auth0's **recommended "Suggested Account Linking" pattern** with server-side verification:

1. **Detection**: After login, the app checks if multiple accounts exist with the same verified email
2. **Initiation**: User is prompted to link accounts
3. **Re-authentication**: User must re-authenticate with their secondary identity to prove ownership
4. **Verification**: Backend validates both tokens before linking
5. **Execution**: Management API links the accounts
6. **Audit**: Linking event is logged to database

## Prerequisites

- Auth0 tenant with at least two connection types configured (e.g., Google OAuth and Email/Password)
- Existing Pizza 42 app setup (see main README.md)
- Vercel Postgres database
- Management API access

## Step 1: Create Regular Web Application in Auth0

The account linking flow requires a **Regular Web Application** (not SPA) for secure session management.

1. Go to **Auth0 Dashboard → Applications → Create Application**
2. Name: `Pizza42 Account Linking`
3. Type: **Regular Web Application**
4. Click **Create**

### Configure Application Settings

In the application settings:

**Allowed Callback URLs:**
```
http://localhost:5173/link/callback
http://localhost:3002/link/callback
https://your-domain.vercel.app/link/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173
https://your-domain.vercel.app
```

**Allowed Web Origins:**
```
http://localhost:5173
http://localhost:3002
https://your-domain.vercel.app
```

**Application Type:** Regular Web App

**Token Endpoint Authentication Method:** Post

Save the following credentials for your `.env.local`:
- **Client ID** → `VITE_AUTH0_LINK_CLIENT_ID`
- **Client Secret** → `AUTH0_LINK_CLIENT_SECRET`

## Step 2: Grant Management API Permissions

Your Machine-to-Machine (M2M) application needs additional scopes for account linking.

1. Go to **Auth0 Dashboard → Applications → API**
2. Find your existing M2M application for Management API
3. Click **APIs** tab
4. Find **Auth0 Management API**
5. Expand and ensure these scopes are enabled:
   - `read:users` ✓ (should already have)
   - `update:users` ✓ (should already have)
   - `update:users_app_metadata` ✓ (should already have)
   - `read:users_app_metadata` ✓ (should already have)

## Step 3: Environment Variables

Add these new variables to your `.env.local` file:

```env
# Existing variables (keep these)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://pizza42.com/api
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_AUDIENCE=https://pizza42.com/api
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-m2m-client-id
AUTH0_CLIENT_SECRET=your-m2m-client-secret
DATABASE_URL=your-postgres-connection-string

# NEW: Account Linking Configuration
VITE_AUTH0_LINK_CLIENT_ID=<client-id-from-step-1>
AUTH0_LINK_CLIENT_SECRET=<client-secret-from-step-1>
CONTINUATION_TOKEN_SECRET=<generate-a-random-32-char-string>
SESSION_SECRET=<generate-a-random-32-char-string>
LINK_SERVER_PORT=3002
VITE_APP_URL=http://localhost:5173

# Management API (use same as existing or create new)
AUTH0_MANAGEMENT_CLIENT_ID=your-m2m-client-id
AUTH0_MANAGEMENT_CLIENT_SECRET=your-m2m-client-secret
```

### Generate Secrets

For `CONTINUATION_TOKEN_SECRET` and `SESSION_SECRET`, generate random strings:

```bash
# macOS/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Database Migration

Run the database migration to add the account linking history table:

```bash
# Connect to your Vercel Postgres database
psql $DATABASE_URL -f backend/schema.sql
```

Or manually run in Vercel SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS account_linking_history (
  id SERIAL PRIMARY KEY,
  primary_user_id VARCHAR(255) NOT NULL,
  secondary_user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  action VARCHAR(20) NOT NULL CHECK (action IN ('linked', 'unlinked')),
  linked_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linking_primary_user ON account_linking_history(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_linking_secondary_user ON account_linking_history(secondary_user_id);
CREATE INDEX IF NOT EXISTS idx_linking_created_at ON account_linking_history(created_at DESC);
```

## Step 5: Install Dependencies

The account linking server requires additional Node packages:

```bash
# Navigate to account-linking directory
cd account-linking

# Install dependencies
npm install

# Or install from root
cd ..
npm install
```

Required packages:
- `express` - Web server framework
- `express-session` - Session middleware
- `pug` - Template engine for linking UI
- `jsonwebtoken` - For continuation tokens
- `auth0` - Management API client

## Step 6: Vercel Environment Variables

Add all the new environment variables to Vercel:

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add each variable from Step 3 for all environments:
   - Production
   - Preview
   - Development

Important variables for Vercel:
```
VITE_AUTH0_LINK_CLIENT_ID
AUTH0_LINK_CLIENT_SECRET
CONTINUATION_TOKEN_SECRET
SESSION_SECRET
VITE_APP_URL (set to your Vercel URL in production)
```

## Step 7: Testing Locally

### Start the Development Servers

You need to run TWO servers for local development:

**Terminal 1 - Frontend + API:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Account Linking Server:**
```bash
cd account-linking
npm run dev
# Runs on http://localhost:3002
```

### Test the Flow

1. **Create Test Accounts:**
   - Sign up with email: `test@yourdomain.com` (password: choose one)
   - Log out
   - Sign up with Google using the SAME email: `test@yourdomain.com`

2. **Trigger Linking Detection:**
   - Log in with either account
   - You should see a yellow popup suggesting account linking

3. **Complete Linking:**
   - Click "Link Accounts" button
   - You'll be redirected to `/link/initiate` page
   - Click "Link Accounts" again
   - Re-authenticate with your OTHER login method
   - See success page at `/link/complete`

4. **Verify Linking:**
   - Go to Profile page (`/profile`)
   - Scroll to "Linked Accounts" section
   - You should see both identities listed

5. **Test Unified Access:**
   - Log out
   - Log in with Google → Should access same profile
   - Log out
   - Log in with Email/Password → Should access same profile

## Step 8: Deploy to Vercel

```bash
# Make sure all environment variables are set in Vercel dashboard first!
vercel --prod
```

### Post-Deployment

1. **Update Auth0 Callbacks:**
   - Go to Auth0 → Applications → Pizza42 Account Linking
   - Add production URL to Allowed Callback URLs:
     ```
     https://your-domain.vercel.app/link/callback
     ```

2. **Test in Production:**
   - Create test accounts with same email
   - Verify linking flow works end-to-end

## Architecture Details

### Flow Diagram

```
User logs in with Google
    ↓
AccountLinkingDetector checks for duplicates
    ↓
Finds email/password account with same email
    ↓
Shows popup: "Link your accounts?"
    ↓
User clicks "Link Accounts"
    ↓
Redirects to /link/initiate
    ↓
Creates continuation token (JWT, 5min expiry)
    ↓
Shows linking prompt with Auth0 button
    ↓
User clicks to re-authenticate
    ↓
Redirects to Auth0 with prompt=login
    ↓
User enters email/password credentials
    ↓
Auth0 redirects to /link/callback with code
    ↓
Backend exchanges code for tokens
    ↓
Verifies authenticated user matches secondary account
    ↓
Calls Management API: Link accounts
    ↓
Saves audit log to database
    ↓
Shows success page
    ↓
User returns to app with unified identity
```

### Security Features

✅ **Email Verification Required** - Only links accounts with verified emails
✅ **Re-authentication** - Proves ownership of both accounts
✅ **Token Validation** - Backend verifies both primary and secondary tokens
✅ **Session Security** - Short-lived continuation tokens (5 minutes)
✅ **CSRF Protection** - State parameter validation
✅ **Audit Trail** - All linking events logged to database
✅ **Primary Identity Preserved** - Maintains consistent user_id across logins

### File Structure

```
account-linking/
├── server.js                 # Express server
├── package.json
├── routes/
│   ├── detect.js            # Check for duplicate accounts
│   ├── initiate.js          # Start linking flow
│   ├── callback.js          # Handle re-auth callback
│   └── link.js              # Execute linking
└── views/
    ├── layout.pug           # Base template
    ├── link-prompt.pug      # Linking prompt UI
    ├── link-success.pug     # Success page
    └── error.pug            # Error page

src/features/account-linking/
├── AccountLinkingDetector.jsx  # Auto-detect duplicates
└── LinkedAccountsBadge.jsx     # Display linked accounts

backend/lib/
└── management-api.js        # Helper functions for linking
```

## Troubleshooting

### "Invalid callback" error
- Check that `/link/callback` is in Allowed Callback URLs
- Verify `VITE_APP_URL` matches your current environment
- Ensure Auth0 application type is "Regular Web App"

### "Linking session expired"
- Continuation tokens expire after 5 minutes
- User needs to restart the linking flow
- Check `CONTINUATION_TOKEN_SECRET` is set correctly

### Accounts not linking
- Verify both accounts have the SAME verified email
- Check Management API has `update:users` scope
- Look for errors in Vercel function logs
- Ensure `AUTH0_MANAGEMENT_CLIENT_ID` and `SECRET` are correct

### Detector not showing
- Check that `email_verified` is `true` for both accounts
- Verify `AccountLinkingDetector` is in `AppLayout.jsx`
- Check browser console for errors
- Ensure `/link/detect` endpoint is accessible

### Session issues
- Verify `SESSION_SECRET` is set
- Check cookies are enabled in browser
- For production, ensure `secure: true` for HTTPS

## API Endpoints

### Detection
```
GET /link/detect?email=user@example.com
```
Returns list of accounts with matching verified email.

### Initiation
```
GET /link/initiate?primaryUserId=auth0|123&secondaryUserId=google-oauth2|456&email=user@example.com
```
Creates continuation token and shows linking prompt.

### Callback
```
GET /link/callback?code=xxx&state=continuation-token
```
Handles Auth0 redirect after re-authentication.

### Link Completion
```
GET /link/complete
```
Executes the linking via Management API.

### Unlink (Frontend-called)
```
POST /link/complete/unlink
Body: { primaryUserId, provider, userId }
```
Unlinks a secondary identity.

## Best Practices

1. **Always verify emails** - Never link unverified accounts
2. **Require re-authentication** - Don't link based on session alone
3. **Log linking events** - Maintain audit trail in database
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Test with multiple providers** - Google, GitHub, Email/Password
6. **Monitor linking activity** - Track in analytics/logs
7. **Provide unlinking** - Let users unlink if needed

## Advanced: Auth0 Action for Auto-Detection

You can enhance this with an Auth0 Action that redirects to linking flow automatically:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const email = event.user.email;
  const email_verified = event.user.email_verified;

  if (!email_verified) {
    return;
  }

  // Check for duplicate accounts
  const { ManagementClient } = require('auth0');
  const management = new ManagementClient({
    domain: event.secrets.AUTH0_DOMAIN,
    clientId: event.secrets.MANAGEMENT_CLIENT_ID,
    clientSecret: event.secrets.MANAGEMENT_CLIENT_SECRET,
  });

  const users = await management.users.getAll({
    q: `email:"${email}"`,
    search_engine: 'v3',
  });

  const verifiedUsers = users.data.filter(u => u.email_verified);

  if (verifiedUsers.length > 1) {
    // Redirect to linking flow
    const linkUrl = `https://your-domain.vercel.app/link/initiate?primaryUserId=${event.user.user_id}&secondaryUserId=${verifiedUsers.find(u => u.user_id !== event.user.user_id).user_id}&email=${email}`;

    api.redirect.sendUserTo(linkUrl);
  }
};
```

## Support

If you encounter issues:
1. Check Auth0 logs in Dashboard → Monitoring → Logs
2. Check Vercel function logs
3. Review browser console for frontend errors
4. Verify all environment variables are set
5. Test locally before deploying to production

## Security Considerations

⚠️ **Important:**
- Never expose client secrets in frontend code
- Always validate tokens on the backend
- Use HTTPS in production (Vercel does this automatically)
- Set secure session cookies in production
- Implement rate limiting for linking endpoints (optional)
- Monitor for suspicious linking activity

## Next Steps

After setup:
- [ ] Test with all your connection types (Google, Email/Password, etc.)
- [ ] Add analytics tracking for linking events
- [ ] Consider adding email notifications when accounts are linked
- [ ] Implement rate limiting for security
- [ ] Add user preferences for auto-linking behavior
- [ ] Create admin dashboard to view linking analytics

---

**Congratulations!** 🎉 You now have a secure, production-ready account linking feature for Pizza 42.
