/**
 * Orders API endpoint
 * GET /api/orders - Get user's orders (protected)
 * POST /api/orders - Create new order (protected)
 */

import { getOrCreateUser, saveOrder, getUserOrders } from '../../backend/lib/db.js';
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

      return res.status(200).json({
        success: true,
        data: orders.map((order) => order.order_data),
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
      });
    }
  }

  // POST - Create new order
  if (req.method === 'POST') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      // Validate required fields
      const { customer, cart, priority, address, phone, position } = req.body;

      if (!customer || !cart || cart.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: customer, cart',
        });
      }

      // Get or create user
      const user = await getOrCreateUser(auth0Id, email, customer);

      // Generate order ID
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate prices
      const pizzaPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const priorityPrice = priority ? pizzaPrice * 0.2 : 0;

      // Calculate estimated delivery (20 mins base + 5 mins per pizza)
      const estimatedDelivery = new Date(
        Date.now() + (20 + cart.reduce((sum, item) => sum + item.quantity, 0) * 5) * 60 * 1000
      ).toISOString();

      // Create order data
      const orderData = {
        id: orderId,
        customer,
        phone: phone || user.phone || '',
        address: address || '',
        priority: priority || false,
        position: position || '',
        cart,
        status: 'preparing',
        estimatedDelivery,
        orderPrice: pizzaPrice,
        priorityPrice,
      };

      // Save order to database
      const savedOrder = await saveOrder(user.id, orderId, orderData);

      return res.status(201).json({
        success: true,
        data: orderData,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create order',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
