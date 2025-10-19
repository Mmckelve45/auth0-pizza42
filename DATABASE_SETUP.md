# Database Setup Guide

This guide will help you set up Vercel Postgres for your Pizza42 application.

## Overview

The application now uses your own database instead of the external restaurant API. This gives you full control over:
- **Menu/Pizzas** - Store and manage your pizza offerings
- **Orders** - Track all customer orders
- **Users** - Store user profiles and preferences

## Step 1: Create Vercel Postgres Database

### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the **Storage** tab
3. Click **Create Database** → **Postgres**
4. Choose a name (e.g., `pizza42-db`)
5. Select a region (choose closest to your users)
6. Click **Create**

Vercel will automatically add the following environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Option B: Use an Existing Database

If you already have a Vercel Postgres database, you can reuse it:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Find your existing `POSTGRES_URL` (or create a new database)
3. Copy the connection string

## Step 2: Set Up Local Environment Variables

Add the database URL to your `.env.local` file:

```bash
# Vercel Postgres
POSTGRES_URL=postgres://username:password@hostname:5432/database
# Or use the pooled connection URL
# POSTGRES_URL=postgres://username:password@hostname:5432/database?pgbouncer=true
```

**Where to find your DATABASE_URL:**
1. Go to Vercel Dashboard → Storage → Your Database
2. Click **.env.local** tab
3. Copy the `POSTGRES_URL` value

## Step 3: Run Database Migrations

Run the schema to create tables:

```bash
# If using Vercel Postgres CLI
vercel env pull .env.local
```

Then connect to your database and run the schema:

### Option A: Using Vercel Postgres UI

1. Go to Vercel Dashboard → Storage → Your Database
2. Click **Query** tab
3. Copy the contents of `backend/schema.sql`
4. Paste and run it

### Option B: Using psql CLI

```bash
# Connect to your database
psql "$(grep POSTGRES_URL .env.local | cut -d '=' -f2-)"

# Run the schema
\i backend/schema.sql

# Verify tables were created
\dt

# Exit
\q
```

## Step 4: Seed the Pizzas

Populate your pizzas table with data from the external API:

```bash
npm run db:seed
```

This will:
- Fetch all pizzas from the external restaurant API
- Insert them into your database
- Can be run multiple times (updates existing pizzas)

You should see output like:
```
🌱 Starting pizza seeding process...
📡 Fetching pizzas from external API...
✅ Fetched 12 pizzas

💾 Inserting pizzas into database...
  ✓ Inserted: Margherita
  ✓ Inserted: Pepperoni
  ...
🎉 Seeding complete!
```

## Step 5: Verify Everything Works

1. Start the API server:
   ```bash
   npm run dev:api
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Visit http://localhost:5173 and:
   - Check if the menu loads
   - Try placing an order (you'll need to be logged in)
   - Check if the order appears in your profile/history

## Troubleshooting

### Error: "no pg_hba.conf entry"
- Your IP address is not allowed to connect to the database
- Vercel Postgres automatically allows connections from Vercel deployments
- For local development, you may need to use the pooled connection URL

### Error: "relation 'pizzas' does not exist"
- The database schema hasn't been applied
- Run the schema from `backend/schema.sql` (see Step 3)

### Error: "No pizzas found in menu"
- Run the seed script: `npm run db:seed`

### Error: "Cannot connect to database"
- Check that `POSTGRES_URL` is set in `.env.local`
- Verify the connection string is correct
- Try using `POSTGRES_URL_NON_POOLING` for local development

## Database Schema

Your database includes these tables:

### **pizzas**
- Stores your menu items
- Fields: id, name, unit_price, image_url, ingredients, sold_out

### **users**
- Stores user profiles linked to Auth0 IDs
- Fields: id, auth0_id, email, name, phone

### **orders**
- Stores all customer orders
- Fields: id, user_id, order_data (JSONB), status, priority

### **user_preferences**
- Stores user preferences (optional)
- Fields: user_id, default_address, default_phone, gps_position, favorite_pizzas

## Production Deployment

When deploying to Vercel:

1. Vercel will automatically use the `POSTGRES_URL` environment variable
2. The database tables should already exist from Step 3
3. Run the seed script on Vercel:
   - Go to Vercel Dashboard → Settings → Functions
   - Or run it manually after deployment via the Vercel CLI:
     ```bash
     vercel env pull
     npm run db:seed
     ```

## Need Help?

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Check your database in Vercel Dashboard](https://vercel.com/dashboard)
