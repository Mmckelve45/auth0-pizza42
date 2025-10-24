# Account Linking Server

Express server implementing Auth0's **Suggested Account Linking** pattern with secure server-side verification.

## What This Does

Allows users with multiple Pizza 42 accounts (same email, different auth methods) to:
- Link accounts together for unified access
- Log in using any method (Google, Email/Password, etc.)
- Access the same profile and order history
- Manage linked identities from Profile page

## How It Works

1. **Detection** - Checks for duplicate accounts by email after login
2. **Prompt** - Shows user a notification to link accounts
3. **Initiate** - Creates secure continuation token with account IDs
4. **Re-authenticate** - User proves ownership by logging in with secondary method
5. **Verify** - Backend validates both tokens match expected accounts
6. **Link** - Calls Auth0 Management API to link accounts
7. **Audit** - Logs linking event to database

## Security Features

✅ Email verification required for both accounts
✅ Re-authentication proves ownership of secondary account
✅ Continuation tokens expire in 5 minutes
✅ Backend validates both primary and secondary tokens
✅ CSRF protection via state parameter
✅ Audit trail stored in database
✅ Session-based security with httpOnly cookies

## API Endpoints

### `GET /link/detect?email=user@example.com`
Checks if multiple accounts exist with this verified email.

**Response:**
```json
{
  "hasDuplicates": true,
  "accountCount": 2,
  "accounts": [
    {
      "user_id": "auth0|123",
      "email": "user@example.com",
      "connection": "Username-Password-Authentication",
      "provider": "auth0"
    },
    {
      "user_id": "google-oauth2|456",
      "email": "user@example.com",
      "connection": "google-oauth2",
      "provider": "google-oauth2"
    }
  ]
}
```

### `GET /link/initiate`
Starts the linking flow by creating a continuation token and showing prompt.

**Query Params:**
- `primaryUserId` - Currently logged in user
- `secondaryUserId` - Account to be linked
- `email` - User's email address

**Response:** HTML page with re-authentication button

### `GET /link/callback`
Handles Auth0 redirect after user re-authenticates.

**Query Params:**
- `code` - Authorization code from Auth0
- `state` - Continuation token

**Response:** Redirects to `/link/complete`

### `GET /link/complete`
Executes the actual linking via Management API.

**Response:** HTML success page

### `POST /link/complete/unlink`
Unlinks a secondary identity from the primary account.

**Body:**
```json
{
  "primaryUserId": "auth0|123",
  "provider": "google-oauth2",
  "userId": "456"
}
```

## Running Locally

```bash
# Install dependencies
npm install

# Set environment variables in ../.env.local
# See ACCOUNT_LINKING_SETUP.md for required vars

# Start server
npm start

# Or use nodemon for auto-reload
npm run dev
```

Server runs on `http://localhost:3002` by default.

## Environment Variables

Required:
- `AUTH0_DOMAIN` - Your Auth0 tenant domain
- `VITE_AUTH0_LINK_CLIENT_ID` - Regular Web App client ID
- `AUTH0_LINK_CLIENT_SECRET` - Regular Web App client secret
- `AUTH0_MANAGEMENT_CLIENT_ID` - M2M app for Management API
- `AUTH0_MANAGEMENT_CLIENT_SECRET` - M2M secret
- `CONTINUATION_TOKEN_SECRET` - Random 32-char string
- `SESSION_SECRET` - Random 32-char string
- `VITE_APP_URL` - Your app URL (http://localhost:5173 locally)

## File Structure

```
account-linking/
├── server.js              # Express app entry point
├── package.json           # Dependencies
├── routes/
│   ├── detect.js         # Duplicate account detection
│   ├── initiate.js       # Start linking flow
│   ├── callback.js       # Handle re-auth callback
│   └── link.js           # Execute linking + unlinking
└── views/
    ├── layout.pug        # Base template
    ├── link-prompt.pug   # Linking confirmation UI
    ├── link-success.pug  # Success message
    └── error.pug         # Error page
```

## Deployment

This server is deployed as a Vercel serverless function via `/api/link/[...path].js`.

The Express app is wrapped and exported for Vercel's serverless environment. Routes are accessible at:
- `https://your-domain.vercel.app/link/detect`
- `https://your-domain.vercel.app/link/initiate`
- `https://your-domain.vercel.app/link/callback`
- `https://your-domain.vercel.app/link/complete`

## Testing

1. Create two accounts with same email (Google + Email/Password)
2. Log in with one account
3. See linking prompt popup
4. Click "Link Accounts"
5. Re-authenticate with other method
6. Verify success page
7. Check Profile page for linked accounts
8. Log out and log in with either method
9. Verify unified access to same profile

## Troubleshooting

**"Invalid callback" error:**
- Check `/link/callback` is in Auth0 Allowed Callback URLs
- Verify Regular Web App is configured, not SPA

**"Linking session expired":**
- Tokens expire after 5 minutes
- User needs to restart the flow

**Accounts not linking:**
- Ensure both emails are VERIFIED
- Check Management API has `update:users` scope
- Review server logs for errors

## Architecture Notes

This is a **Regular Web Application** pattern (not SPA) because:
- Needs server-side sessions to maintain linking state
- Requires secure storage of continuation tokens
- Must validate tokens on backend before linking
- Sessions are required between callback and completion

The continuation token (JWT) contains:
```json
{
  "primaryUserId": "auth0|123",
  "secondaryUserId": "google-oauth2|456",
  "email": "user@example.com",
  "timestamp": 1234567890,
  "exp": 1234568190  // 5 minutes later
}
```

## Next Steps

After basic linking works:
- [ ] Add email notifications when accounts are linked
- [ ] Implement rate limiting to prevent abuse
- [ ] Add user preference for auto-linking
- [ ] Create admin dashboard for linking analytics
- [ ] Add webhook notifications for linking events

## Support

For detailed setup instructions, see `/ACCOUNT_LINKING_SETUP.md` in the root directory.

For Auth0 documentation on account linking:
https://auth0.com/docs/manage-users/user-accounts/user-account-linking
