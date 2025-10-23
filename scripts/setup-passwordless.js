#!/usr/bin/env node

/**
 * Setup Passwordless Authentication with Email Magic Link
 * This script configures Auth0 passwordless connection and custom email template
 */

import dotenv from 'dotenv';
import { ManagementClient } from 'auth0';

dotenv.config({ path: '.env.local' });

const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
});

// Custom email template for passwordless magic link
const emailTemplate = {
  template: 'verify_email',
  body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Pizza 42 Verification Code</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;600;700&display=swap');

    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto Mono', monospace;
      background-color: #f5f5f4;
      -webkit-font-smoothing: antialiased;
    }

    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .header {
      background-color: #FACC15;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 3px solid #78716c;
    }

    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #292524;
    }

    .content {
      padding: 40px 32px;
      color: #44403c;
    }

    .content h2 {
      font-size: 24px;
      margin: 0 0 16px 0;
      color: #292524;
      font-weight: 600;
    }

    .content p {
      font-size: 14px;
      line-height: 1.6;
      margin: 16px 0;
      color: #57534e;
    }

    .button-container {
      text-align: center;
      margin: 32px 0;
    }

    .magic-link-button {
      display: inline-block;
      padding: 16px 48px;
      background-color: #FACC15;
      color: #000000 !important;
      text-decoration: none !important;
      font-weight: 700;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-radius: 9999px;
      transition: background-color 0.3s ease;
    }

    .magic-link-button:hover {
      background-color: #FDE047;
      color: #000000 !important;
    }

    .magic-link-button:visited {
      color: #000000 !important;
    }

    .magic-link-button:active {
      color: #000000 !important;
    }

    .alternative-link {
      margin-top: 24px;
      padding: 16px;
      background-color: #f5f5f4;
      border-radius: 8px;
      word-break: break-all;
    }

    .alternative-link p {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #78716c;
    }

    .alternative-link a {
      color: #292524;
      font-size: 11px;
      text-decoration: underline;
    }

    .footer {
      padding: 32px;
      text-align: center;
      background-color: #fafaf9;
      border-top: 1px solid #e7e5e4;
    }

    .footer p {
      margin: 8px 0;
      font-size: 12px;
      color: #a8a29e;
    }

    .tagline {
      font-style: italic;
      color: #EAB308;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🍕 PIZZA 42</h1>
    </div>

    <div class="content">
      <h2>Welcome back! 👋</h2>
      <p>Here's your verification code to sign in to your Pizza 42 account. No password needed!</p>

      <div class="button-container">
        <div class="magic-link-button" style="font-size: 32px; letter-spacing: 8px; padding: 24px 32px;">
          {{ code }}
        </div>
      </div>

      <p style="margin-top: 24px; font-size: 13px;">Enter this code in your browser to complete sign-in.</p>

      <p>This code will expire in 5 minutes and can only be used once.</p>

      <p class="tagline">The best pizza. Straight out of the oven, straight to you.</p>
    </div>

    <div class="footer">
      <p>If you didn't request this email, you can safely ignore it.</p>
      <p>&copy; ${new Date().getFullYear()} Pizza 42. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,
  from: 'Pizza 42 <noreply@pizza42.com>',
  subject: 'Your Pizza 42 verification code 🍕',
  syntax: 'liquid',
  enabled: true,
};

async function setupPasswordless() {
  try {
    console.log('🔧 Setting up passwordless authentication for Pizza 42...\n');

    // Step 1: Get existing passwordless email connection
    console.log('📧 Step 1: Getting existing passwordless email connection...');
    const allConnections = await auth0.connections.getAll();
    console.log(`   Found ${allConnections.data.length} total connections`);

    const connections = allConnections.data.filter(c => c.strategy === 'email');
    console.log(`   Found ${connections.length} email connections`);

    if (connections.length === 0) {
      throw new Error('No passwordless email connection found. Please create one in the Auth0 Dashboard first.');
    }

    const passwordlessConnection = connections[0];
    console.log(`   ✓ Using connection: ${passwordlessConnection.name} (ID: ${passwordlessConnection.id})`);


    // Step 2: Update the connection to use verification code (OTP)
    console.log('\n🔗 Step 2: Configuring verification code authentication...');
    await auth0.connections.update(
      { id: passwordlessConnection.id },
      {
        options: {
          ...passwordlessConnection.options,
          authParams: {
            scope: 'openid profile email read:orders create:orders update:orders read:profile update:profile',
          },
          brute_force_protection: true,
          disable_signup: false,
          name: 'email',
          email: {
            syntax: 'liquid',
            from: 'Pizza 42 <noreply@pizza.kelverstudios.com>',
            subject: 'Your Pizza 42 verification code 🍕',
            body: emailTemplate.body,
          },
          OTP: {
            time_step: 300,
            length: 6,
          },
        },
      }
    );
    console.log('   ✓ Verification code configured');

    // Step 3: Enable the connection for your application
    console.log('\n🔌 Step 3: Enabling connection for your application...');
    const client = await auth0.clients.get({ client_id: process.env.AUTH0_CLIENT_ID });

    const enabledConnections = new Set(passwordlessConnection.enabled_clients || []);
    enabledConnections.add(process.env.AUTH0_CLIENT_ID);

    await auth0.connections.update(
      { id: passwordlessConnection.id },
      {
        enabled_clients: Array.from(enabledConnections),
      }
    );
    console.log(`   ✓ Connection enabled for: ${client.name}`);

    // Step 4: Display summary
    console.log('\n✨ Setup Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 CONFIGURATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Connection Name:     ${passwordlessConnection.name}`);
    console.log(`Connection ID:       ${passwordlessConnection.id}`);
    console.log(`Strategy:            Passwordless Email (Verification Code)`);
    console.log(`Email From:          Pizza 42 <noreply@pizza42.com>`);
    console.log(`Branding:            Yellow-400 primary, Roboto Mono font`);
    console.log(`Sign-up Enabled:     Yes`);
    console.log(`Brute Force:         Enabled`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 NEXT STEPS:');
    console.log('1. Configure your email provider in Auth0 Dashboard:');
    console.log('   https://manage.auth0.com/dashboard/us/pizza42-mckelvey/emails/provider');
    console.log('\n2. Test the passwordless flow in your application');
    console.log('\n3. Update your login UI to support passwordless authentication\n');

    console.log('💡 TIP: You can customize the email template further in:');
    console.log('   Auth0 Dashboard > Branding > Email Templates\n');

  } catch (error) {
    console.error('❌ Error setting up passwordless authentication:', error.message);
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`);
    }
    if (error.body) {
      console.error(`   Details: ${JSON.stringify(error.body, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run the setup
setupPasswordless();
