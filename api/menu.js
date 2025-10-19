/**
 * Menu API endpoint
 * GET /api/menu - Fetch pizza menu from database (public)
 */

import { getAllPizzas } from '../backend/lib/db.js';
import { cors } from '../backend/middleware/cors.js';
import { asyncHandler } from '../backend/middleware/error-handler.js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pizzas = await getAllPizzas();

    // Transform database fields to match frontend expectations
    const menu = pizzas.map((pizza) => ({
      id: pizza.id,
      name: pizza.name,
      unitPrice: parseFloat(pizza.unit_price),
      imageUrl: pizza.image_url,
      ingredients: pizza.ingredients,
      soldOut: pizza.sold_out,
    }));

    // Return in same format as external API: { data: [...] }
    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch menu',
    });
  }
};

export default cors(asyncHandler(handler));
