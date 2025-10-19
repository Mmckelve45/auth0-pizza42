/**
 * Single Order API endpoint
 * GET /api/orders/:orderId - Get specific order (protected)
 * PATCH /api/orders/:orderId - Update order priority (protected)
 */

import { getOrderByIdAndUser, updateOrder as updateDbOrder, getOrCreateUser } from '../../backend/lib/db.js';
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
        return res.status(404).json({
          success: false,
          error: 'Order not found or does not belong to you',
        });
      }

      return res.status(200).json({
        success: true,
        data: dbOrder.order_data,
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
      });
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
        return res.status(404).json({
          success: false,
          error: 'Order not found or does not belong to you',
        });
      }

      // Update order data
      const updateData = req.body;
      const currentOrderData = dbOrder.order_data;

      // Recalculate priority price if priority is being updated
      if (updateData.priority !== undefined) {
        const priorityPrice = updateData.priority ? currentOrderData.orderPrice * 0.2 : 0;
        currentOrderData.priority = updateData.priority;
        currentOrderData.priorityPrice = priorityPrice;
      }

      // Update database
      const updatedOrder = await updateDbOrder(orderId, {
        orderData: currentOrderData,
        priority: currentOrderData.priority,
      });

      return res.status(200).json({
        success: true,
        data: updatedOrder.order_data,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update order',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
