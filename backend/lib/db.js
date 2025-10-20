/**
 * Database client configuration
 * Using Vercel Postgres (or can be swapped with Supabase)
 */

import { sql } from '@vercel/postgres';

// ============================================
// PIZZA / MENU FUNCTIONS
// ============================================

/**
 * Get all pizzas from menu
 * @returns {Array} - Array of pizza records
 */
export const getAllPizzas = async () => {
  try {
    const { rows } = await sql`
      SELECT * FROM pizzas
      ORDER BY name ASC
    `;
    return rows;
  } catch (error) {
    console.error('Database error in getAllPizzas:', error);
    throw error;
  }
};

/**
 * Get pizza by ID
 * @param {number} pizzaId - Pizza ID
 * @returns {Object|null} - Pizza record or null
 */
export const getPizzaById = async (pizzaId) => {
  try {
    const { rows } = await sql`
      SELECT * FROM pizzas WHERE id = ${pizzaId}
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database error in getPizzaById:', error);
    throw error;
  }
};

/**
 * Create or update a pizza
 * @param {Object} pizzaData - Pizza data
 * @returns {Object} - Created/updated pizza record
 */
export const upsertPizza = async (pizzaData) => {
  try {
    const { id, name, unitPrice, imageUrl, ingredients, soldOut } = pizzaData;

    const { rows } = await sql`
      INSERT INTO pizzas (id, name, unit_price, image_url, ingredients, sold_out, created_at, updated_at)
      VALUES (
        ${id},
        ${name},
        ${unitPrice},
        ${imageUrl},
        ${ingredients ? JSON.stringify(ingredients) : null},
        ${soldOut || false},
        NOW(),
        NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        name = ${name},
        unit_price = ${unitPrice},
        image_url = ${imageUrl},
        ingredients = ${ingredients ? JSON.stringify(ingredients) : null},
        sold_out = ${soldOut || false},
        updated_at = NOW()
      RETURNING *
    `;

    return rows[0];
  } catch (error) {
    console.error('Database error in upsertPizza:', error);
    throw error;
  }
};

// ============================================
// USER FUNCTIONS
// ============================================

/**
 * Get or create user by Auth0 ID
 * @param {Object} userData - User data from Auth0 token
 * @returns {Object} - User record from database
 */
export const getOrCreateUser = async (auth0Id, email, name = null) => {
  try {
    // If email is null, create a placeholder email from auth0Id
    const userEmail = email || `${auth0Id.replace(/[|@]/g, '-')}@placeholder.local`;

    // Check if user exists
    const { rows } = await sql`
      SELECT * FROM users WHERE auth0_id = ${auth0Id}
    `;

    if (rows.length > 0) {
      return rows[0];
    }

    // Create new user
    const { rows: newUserRows } = await sql`
      INSERT INTO users (auth0_id, email, name, created_at, updated_at)
      VALUES (${auth0Id}, ${userEmail}, ${name}, NOW(), NOW())
      RETURNING *
    `;

    return newUserRows[0];
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Object|null} - User record or null
 */
export const getUserById = async (userId) => {
  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database error in getUserById:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User UUID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated user record
 */
export const updateUser = async (userId, updates) => {
  try {
    const { name, phone } = updates;
    const { rows } = await sql`
      UPDATE users
      SET
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Database error in updateUser:', error);
    throw error;
  }
};

/**
 * Save order to database
 * @param {string} userId - User UUID
 * @param {string} orderId - Order ID from restaurant API
 * @param {Object} orderData - Full order data
 * @returns {Object} - Saved order record
 */
export const saveOrder = async (userId, orderId, orderData) => {
  try {
    const { rows } = await sql`
      INSERT INTO orders (id, user_id, order_data, status, priority, created_at, updated_at)
      VALUES (
        ${orderId},
        ${userId},
        ${JSON.stringify(orderData)},
        ${orderData.status || 'pending'},
        ${orderData.priority || false},
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Database error in saveOrder:', error);
    throw error;
  }
};

/**
 * Get user's orders
 * @param {string} userId - User UUID
 * @param {number} limit - Maximum number of orders to return
 * @returns {Array} - Array of order records
 */
export const getUserOrders = async (userId, limit = 20) => {
  try {
    const { rows } = await sql`
      SELECT * FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (error) {
    console.error('Database error in getUserOrders:', error);
    throw error;
  }
};

/**
 * Get order by ID and verify ownership
 * @param {string} orderId - Order ID
 * @param {string} userId - User UUID
 * @returns {Object|null} - Order record or null
 */
export const getOrderByIdAndUser = async (orderId, userId) => {
  try {
    const { rows } = await sql`
      SELECT * FROM orders
      WHERE id = ${orderId} AND user_id = ${userId}
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database error in getOrderByIdAndUser:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated order record
 */
export const updateOrder = async (orderId, updates) => {
  try {
    const { status, priority, orderData } = updates;
    const { rows } = await sql`
      UPDATE orders
      SET
        status = COALESCE(${status}, status),
        priority = COALESCE(${priority}, priority),
        order_data = COALESCE(${orderData ? JSON.stringify(orderData) : null}, order_data),
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Database error in updateOrder:', error);
    throw error;
  }
};

/**
 * Get or create user preferences
 * @param {string} userId - User UUID
 * @returns {Object} - User preferences record
 */
export const getUserPreferences = async (userId) => {
  try {
    const { rows } = await sql`
      SELECT * FROM user_preferences WHERE user_id = ${userId}
    `;

    if (rows.length > 0) {
      return rows[0];
    }

    // Create default preferences
    const { rows: newRows } = await sql`
      INSERT INTO user_preferences (user_id, updated_at)
      VALUES (${userId}, NOW())
      RETURNING *
    `;

    return newRows[0];
  } catch (error) {
    console.error('Database error in getUserPreferences:', error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param {string} userId - User UUID
 * @param {Object} preferences - Preferences to update
 * @returns {Object} - Updated preferences record
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const { defaultAddress, defaultPhone, gpsPosition, favoritePizzas } = preferences;

    const { rows } = await sql`
      INSERT INTO user_preferences (
        user_id,
        default_address,
        default_phone,
        gps_position,
        favorite_pizzas,
        updated_at
      )
      VALUES (
        ${userId},
        ${defaultAddress},
        ${defaultPhone},
        ${gpsPosition ? JSON.stringify(gpsPosition) : null},
        ${favoritePizzas ? JSON.stringify(favoritePizzas) : null},
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        default_address = COALESCE(${defaultAddress}, user_preferences.default_address),
        default_phone = COALESCE(${defaultPhone}, user_preferences.default_phone),
        gps_position = COALESCE(${gpsPosition ? JSON.stringify(gpsPosition) : null}, user_preferences.gps_position),
        favorite_pizzas = COALESCE(${favoritePizzas ? JSON.stringify(favoritePizzas) : null}, user_preferences.favorite_pizzas),
        updated_at = NOW()
      RETURNING *
    `;

    return rows[0];
  } catch (error) {
    console.error('Database error in updateUserPreferences:', error);
    throw error;
  }
};
