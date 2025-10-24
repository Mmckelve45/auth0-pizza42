#!/usr/bin/env node

/**
 * Email Verification Template for Pizza 42
 * This template is for the "Verification Email" in Auth0 Dashboard
 *
 * To use:
 * 1. Go to Auth0 Dashboard > Branding > Email Templates
 * 2. Select "Verification Email"
 * 3. Copy the template below and paste it into the HTML editor
 * 4. Save and test
 */

const verificationEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Pizza 42 Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; background-color: #f5f5f4;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

    <!-- Header -->
    <div style="background-color: #FACC15; padding: 40px 20px; text-align: center; border-bottom: 3px solid #78716c;">
      <h1 style="margin: 0; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #292524;">
        🍕 PIZZA 42
      </h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px; color: #44403c;">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #292524; font-weight: 600; text-align: center;">
        Welcome! 👋
      </h2>

      <p style="font-size: 14px; line-height: 1.6; margin: 16px 0; color: #57534e; text-align: center;">
        Click the button below to verify your email address and activate your Pizza 42 account.
      </p>

      <!-- Account Info Box -->
      <div style="background-color: #fafaf9; border-radius: 8px; padding: 16px; margin: 24px auto; max-width: 400px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #78716c;">Account Email:</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #292524; font-weight: 600;">
          {{ user.email | escape }}
        </p>
      </div>

      <!-- Verify Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ url | escape }}" style="display: inline-block; padding: 20px 60px; background-color: #FACC15; color: #000000; text-decoration: none; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; border-radius: 9999px;">
          VERIFY YOUR ACCOUNT
        </a>
      </div>

      <p style="margin-top: 24px; font-size: 13px; line-height: 1.6; color: #57534e; text-align: center;">
        This link will expire in 5 days and can only be used once.
      </p>

      <!-- Alternative Link -->
      <div style="margin-top: 24px; padding: 16px; background-color: #f5f5f4; border-radius: 8px; word-break: break-all;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #78716c; text-align: center;">
          <strong>Button not working?</strong> Copy and paste this link into your browser:
        </p>
        <p style="margin: 0; font-size: 11px; text-align: center;">
          <a href="{{ url | escape }}" style="color: #292524; text-decoration: underline;">{{ url | escape }}</a>
        </p>
      </div>

      <p style="font-style: italic; color: #EAB308; margin-top: 24px; font-size: 14px; text-align: center;">
        The best pizza. Straight out of the oven, straight to you.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 32px; text-align: center; background-color: #fafaf9; border-top: 1px solid #e7e5e4;">
      <p style="margin: 8px 0; font-size: 12px; color: #a8a29e;">
        If you didn't create an account, you can safely ignore this email.
      </p>
      <p style="margin: 8px 0; font-size: 12px; color: #a8a29e;">
        &copy; {{ "now" | date: "%Y" }} Pizza 42. All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>`;

console.log('📧 Email Verification Template for Pizza 42\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Copy the template below and paste into Auth0 Dashboard:');
console.log('Auth0 Dashboard > Branding > Email Templates > Verification Email');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(verificationEmailTemplate);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
