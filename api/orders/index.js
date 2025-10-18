/**
 * Orders API endpoint
 * GET /api/orders - Get user's orders (protected)
 * POST /api/orders - Create new order (protected)
 */

import { createOrder } from '../../backend/lib/restaurant-api.js';
import { getOrCreateUser, saveOrder, getUserOrders } from '../../backend/lib/db.js';
import { success, badRequest, serverError } from '../../backend/lib/response.js';
import { requireAuth } from '../../backend/middleware/auth.js';
import { cors } from '../../backend/middleware/cors.js';
import { asyncHandler } from '../../backend/middleware/error-handler.js';
import { getUserIdFromToken, getEmailFromToken } from '../../backend/lib/auth0.js';

const handler = async (req, res) => {
  // GET - Fetch user's order history
  if (req.method === 'GET') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      // Get or create user in our database
      const user = await getOrCreateUser(auth0Id, email);

      // Fetch user's orders
      const orders = await getUserOrders(user.id);

      return res.status(200).json(success(orders));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json(serverError('Failed to fetch orders'));
    }
  }

  // POST - Create new order
  if (req.method === 'POST') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      // Validate required fields
      const { customer, cart, priority, estimatedDelivery, address, phone, position } = req.body;

      if (!customer || !cart || cart.length === 0) {
        return res.status(400).json(badRequest('Missing required fields: customer, cart'));
      }

      // Get or create user
      const user = await getOrCreateUser(auth0Id, email, customer);

      // Create order with restaurant API
      const orderData = {
        customer,
        phone: phone || user.phone,
        address: address || '',
        priority: priority || false,
        position: position || '',
        cart,
      };

      const restaurantOrder = await createOrder(orderData);

      // Save order to our database
      const savedOrder = await saveOrder(user.id, restaurantOrder.data.id, restaurantOrder.data);

      return res.status(201).json(success(savedOrder));
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json(serverError('Failed to create order'));
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
