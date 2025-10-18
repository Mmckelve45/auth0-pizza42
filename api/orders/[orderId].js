/**
 * Single Order API endpoint
 * GET /api/orders/:orderId - Get specific order (protected)
 * PATCH /api/orders/:orderId - Update order priority (protected)
 */

import { getOrder, updateOrder as updateRestaurantOrder } from '../../backend/lib/restaurant-api.js';
import { getOrderByIdAndUser, updateOrder as updateDbOrder, getOrCreateUser } from '../../backend/lib/db.js';
import { success, notFound, serverError } from '../../backend/lib/response.js';
import { requireAuth } from '../../backend/middleware/auth.js';
import { cors } from '../../backend/middleware/cors.js';
import { asyncHandler } from '../../backend/middleware/error-handler.js';
import { getUserIdFromToken, getEmailFromToken } from '../../backend/lib/auth0.js';

const handler = async (req, res) => {
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  // GET - Fetch specific order
  if (req.method === 'GET') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      const user = await getOrCreateUser(auth0Id, email);

      // Check if order belongs to user
      const dbOrder = await getOrderByIdAndUser(orderId, user.id);

      if (!dbOrder) {
        return res.status(404).json(notFound('Order not found or does not belong to you'));
      }

      // Fetch fresh data from restaurant API
      const restaurantOrder = await getOrder(orderId);

      // Update our database with fresh data
      await updateDbOrder(orderId, {
        orderData: restaurantOrder.data,
        status: restaurantOrder.data.status,
      });

      return res.status(200).json(success(restaurantOrder.data));
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json(serverError('Failed to fetch order'));
    }
  }

  // PATCH - Update order (e.g., priority)
  if (req.method === 'PATCH') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      const user = await getOrCreateUser(auth0Id, email);

      // Check ownership
      const dbOrder = await getOrderByIdAndUser(orderId, user.id);

      if (!dbOrder) {
        return res.status(404).json(notFound('Order not found or does not belong to you'));
      }

      // Update restaurant order
      const updateData = req.body;
      const updatedRestaurantOrder = await updateRestaurantOrder(orderId, updateData);

      // Update our database
      await updateDbOrder(orderId, {
        orderData: updatedRestaurantOrder.data,
        priority: updateData.priority,
        status: updatedRestaurantOrder.data.status,
      });

      return res.status(200).json(success(updatedRestaurantOrder.data));
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json(serverError('Failed to update order'));
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
