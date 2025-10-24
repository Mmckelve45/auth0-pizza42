#!/usr/bin/env node

/**
 * Setup Universal Login Customization for Pizza 42
 * This script configures Auth0 Universal Login with custom branding
 *
 * Required Management API Scopes:
 * - read:branding
 * - update:branding
 */

import dotenv from 'dotenv';
import { ManagementClient } from 'auth0';

dotenv.config({ path: '.env.local' });

const auth0 = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
});

// Custom Universal Login page template
const universalLoginTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Sign In - Pizza 42</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Courier New', Courier, monospace;
      background: linear-gradient(135deg, #FACC15 0%, #FDE047 50%, #FEF3C7 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow-x: hidden;
    }

    /* Decorative pizza emojis in background */
    body::before {
      content: '🍕';
      position: absolute;
      top: 10%;
      left: 10%;
      font-size: 60px;
      opacity: 0.15;
      animation: float 6s ease-in-out infinite;
    }

    body::after {
      content: '🍕';
      position: absolute;
      bottom: 15%;
      right: 10%;
      font-size: 80px;
      opacity: 0.15;
      animation: float 8s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(10deg);
      }
    }

    .login-container {
      max-width: 450px;
      width: 100%;
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .login-header {
      background-color: #FACC15;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 3px solid #78716c;
      position: relative;
    }

    .login-header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #292524;
    }

    .pizza-emoji {
      font-size: 48px;
      display: block;
      margin: 0 auto 10px;
      animation: spin 20s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .login-content {
      padding: 40px 32px;
    }

    .login-content h2 {
      font-size: 24px;
      margin: 0 0 24px 0;
      color: #292524;
      font-weight: 600;
      text-align: center;
    }

    /* Auth0 Lock container styling */
    #auth0-lock-container-1 {
      font-family: 'Courier New', Courier, monospace !important;
    }

    .auth0-lock.auth0-lock {
      font-family: 'Courier New', Courier, monospace !important;
    }

    .auth0-lock-header {
      display: none !important;
    }

    .auth0-lock-submit {
      background-color: #FACC15 !important;
      color: #000000 !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 2px !important;
      border-radius: 9999px !important;
      padding: 14px 20px !important;
      border: none !important;
    }

    .auth0-lock-submit:hover {
      background-color: #FDE047 !important;
    }

    .auth0-lock-input-wrap {
      border-radius: 8px !important;
    }

    .auth0-lock-input {
      border-radius: 8px !important;
      font-family: 'Courier New', Courier, monospace !important;
    }

    .tagline {
      text-align: center;
      font-style: italic;
      color: #EAB308;
      margin-top: 24px;
      font-size: 14px;
    }

    .login-footer {
      padding: 24px 32px;
      text-align: center;
      background-color: #fafaf9;
      border-top: 1px solid #e7e5e4;
    }

    .login-footer p {
      margin: 8px 0;
      font-size: 12px;
      color: #a8a29e;
    }

    .login-footer a {
      color: #292524;
      text-decoration: underline;
      font-weight: 600;
    }

    .login-footer a:hover {
      color: #EAB308;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-container {
        border-radius: 0;
      }

      .login-header h1 {
        font-size: 24px;
      }

      .pizza-emoji {
        font-size: 36px;
      }

      .login-content {
        padding: 24px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <span class="pizza-emoji">🍕</span>
      <h1>PIZZA 42</h1>
    </div>

    <div class="login-content">
      <h2>Welcome Back!</h2>

      <!--[if IE 8]>
      <script src="//cdnjs.cloudflare.com/ajax/libs/ie8/0.2.5/ie8.js"></script>
      <![endif]-->

      <!--[if lte IE 9]>
      <script src="https://cdn.auth0.com/js/base64.js"></script>
      <script src="https://cdn.auth0.com/js/es5-shim.min.js"></script>
      <![endif]-->

      <script src="https://cdn.auth0.com/js/lock/11.30/lock.min.js"></script>
      <script>
        // Decode configuration from URL
        var config = JSON.parse(decodeURIComponent(escape(window.atob('@@config@@'))));
        config.extraParams = config.extraParams || {};

        var connection = config.connection;
        var prompt = config.prompt;
        var languageDictionary;
        var language;

        if (config.dict && config.dict.signin && config.dict.signin.title) {
          languageDictionary = { title: config.dict.signin.title };
        } else if (typeof config.dict === 'string') {
          language = config.dict;
        }

        var loginHint = config.extraParams.login_hint;
        var colors = config.colors || {};

        // Instantiate Lock
        var lock = new Auth0Lock(config.clientID, config.auth0Domain, {
          auth: {
            redirectUrl: config.callbackURL,
            responseType: (config.internalOptions || {}).response_type ||
              (config.callbackOnLocationHash ? 'token' : 'code'),
            params: config.internalOptions
          },
          configurationBaseUrl: config.clientConfigurationBaseUrl,
          overrides: {
            __tenant: config.auth0Tenant,
            __token_issuer: config.authorizationServer.issuer
          },
          assetsUrl:  config.assetsUrl,
          allowedConnections: connection ? [connection] : null,
          rememberLastLogin: !prompt,
          language: language,
          languageDictionary: languageDictionary,
          theme: {
            logo: 'https://em-content.zobj.net/thumbs/240/apple/354/pizza_1f355.png',
            primaryColor: colors.primary || '#FACC15'
          },
          prefill: loginHint ? { email: loginHint, username: loginHint } : null,
          closable: false,
          defaultADUsernameFromEmailPrefix: false,
          // Additional customization
          additionalSignUpFields: []
        });

        lock.show();
      </script>

      <p class="tagline">The best pizza. Straight out of the oven, straight to you.</p>
    </div>

    <div class="login-footer">
      <p>
        <a href="https://pizza42.com/terms" target="_blank" rel="noopener">Terms of Service</a> ·
        <a href="https://pizza42.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Pizza 42. All rights reserved.</p>
      <p style="margin-top: 12px; font-size: 11px;">
        Need help? <a href="mailto:support@pizza42.com">Contact Support</a>
      </p>
    </div>
  </div>
</body>
</html>`;

async function setupUniversalLogin() {
  try {
    console.log('🎨 Setting up Universal Login customization for Pizza 42...\n');

    // Step 1: Update branding colors and settings
    console.log('🎨 Step 1: Updating branding settings...');
    try {
      await auth0.branding.updateSettings({
        colors: {
          primary: '#FACC15',
          page_background: '#FACC15'
        },
        favicon_url: 'https://em-content.zobj.net/thumbs/240/apple/354/pizza_1f355.png',
        logo_url: 'https://em-content.zobj.net/thumbs/240/apple/354/pizza_1f355.png'
        // Using system fonts (Courier New) via template CSS
      });
      console.log('   ✓ Branding colors updated (Primary: #FACC15)');
    } catch (error) {
      if (error.statusCode === 403) {
        console.log('   ⚠️  Permission denied for branding settings.');
        console.log('   💡 You may need to add the "update:branding" scope to your Management API application.');
      } else {
        throw error;
      }
    }

    // Step 2: Update Universal Login template via API (requires custom domain)
    console.log('\n🔐 Step 2: Checking Universal Login template customization...');
    try {
      await auth0.branding.setUniversalLoginTemplate({
        template: universalLoginTemplate
      });
      console.log('   ✓ Universal Login template updated successfully!');
      console.log('   ✓ Your login page now features Pizza 42 branding with gradient and pizza emojis');
    } catch (error) {
      if (error.message && error.message.includes('custom domain')) {
        console.log('   ℹ️  Custom domain required for API-based template customization');
        console.log('   ℹ️  Branding (colors/logo) is already set!');
        console.log('\n   📋 Options to add custom HTML template:');
        console.log('   Option A: Set up custom domain, then re-run this script');
        console.log('   Option B: Manually paste template (run with --print-template flag)');
      } else if (error.statusCode === 403) {
        console.log('   ⚠️  Permission denied for Universal Login template.');
        console.log('   💡 You may need to add the "update:branding" scope to your Management API application.');
      } else if (error.statusCode === 400) {
        console.log('   ⚠️  Template validation error.');
        console.log('   💡 Details:', error.message);
      } else {
        console.log('   ℹ️  Template API unavailable:', error.message);
        console.log('   💡 Use --print-template flag for manual setup');
      }
    }

    // Step 3: Display summary
    console.log('\n✨ Setup Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 UNIVERSAL LOGIN CUSTOMIZATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Primary Color:       #FACC15 (Pizza 42 Yellow)');
    console.log('Background:          Gradient (Yellow tones)');
    console.log('Font:                Courier New (monospace)');
    console.log('Logo:                Pizza emoji (🍕)');
    console.log('Terms of Service:    Footer links added');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 NEXT STEPS:');
    console.log('1. Test your Universal Login page:');
    console.log(`   https://${process.env.AUTH0_DOMAIN}/authorize?client_id=${process.env.AUTH0_CLIENT_ID}&response_type=code&redirect_uri=${process.env.AUTH0_REDIRECT_URI}&scope=openid%20profile%20email`);
    console.log('\n2. To update terms/privacy links, edit the template in this script and re-run');
    console.log('\n3. View/modify template in Auth0 Dashboard:');
    console.log('   Dashboard > Branding > Universal Login > Advanced Options > Login\n');

    console.log('💡 TEMPLATE CUSTOMIZATION:');
    console.log('The template is fully customizable via this script.');
    console.log('Edit the `universalLoginTemplate` variable and re-run to update.\n');

  } catch (error) {
    console.error('❌ Error setting up Universal Login:', error.message);
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`);
    }
    if (error.body) {
      console.error(`   Details: ${JSON.stringify(error.body, null, 2)}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 REQUIRED MANAGEMENT API SCOPES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To enable this script, add these scopes to your Management API application:');
    console.log('  • read:branding');
    console.log('  • update:branding');
    console.log('\nSteps to add scopes:');
    console.log('1. Go to Auth0 Dashboard > Applications > APIs');
    console.log('2. Find "Auth0 Management API"');
    console.log('3. Go to "Machine to Machine Applications" tab');
    console.log('4. Find your M2M application and expand it');
    console.log('5. Add the scopes listed above');
    console.log('6. Save and re-run this script\n');

    console.log('💡 ALTERNATIVE: Manual Template Copy/Paste');
    console.log('You can also manually customize the Universal Login page:');
    console.log('Run: node scripts/setup-universal-login.js --print-template\n');

    process.exit(1);
  }
}

// Check if user wants to print template only
if (process.argv.includes('--print-template')) {
  console.log('🍕 Universal Login Template for Pizza 42\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Copy the template below and paste into Auth0 Dashboard:');
  console.log('Auth0 Dashboard > Branding > Universal Login > Advanced Options > Login');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(universalLoginTemplate);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
} else {
  // Run the setup with API
  setupUniversalLogin();
}
