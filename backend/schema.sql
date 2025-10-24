-- Pizza 42 Database Schema
-- For use with Vercel Postgres or PostgreSQL

-- Pizzas/Menu table
CREATE TABLE IF NOT EXISTS pizzas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  ingredients JSONB,
  sold_out BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pizzas_name ON pizzas(name);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on auth0_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth0_id ON users(auth0_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_address TEXT,
  default_phone VARCHAR(50),
  gps_position JSONB,
  favorite_pizzas JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_preferences table
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to pizzas table
DROP TRIGGER IF EXISTS update_pizzas_updated_at ON pizzas;
CREATE TRIGGER update_pizzas_updated_at
  BEFORE UPDATE ON pizzas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Account Linking History table
-- Tracks when accounts are linked/unlinked for audit purposes
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

-- Create indexes for querying linking history
CREATE INDEX IF NOT EXISTS idx_linking_primary_user ON account_linking_history(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_linking_secondary_user ON account_linking_history(secondary_user_id);
CREATE INDEX IF NOT EXISTS idx_linking_created_at ON account_linking_history(created_at DESC);
