/**
 * Order Management Component
 * Fetches and displays orders from .NET API
 */

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const DOTNET_API_URL = import.meta.env.VITE_DOTNET_API_URL || 'http://localhost:5041';

/**
 * Convert timestamp to relative time (e.g., "10 minutes ago")
 */
function getRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return past.toLocaleDateString();
  }
}

function OrderManagement() {
  const { getAccessTokenSilently } = useAuth0();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get Auth0 access token
      const token = await getAccessTokenSilently();

      const response = await fetch(`${DOTNET_API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${DOTNET_API_URL}/api/orders/${orderId}/status?newStatus=${newStatus}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updateOrderPriority = async (orderId, newPriority) => {
    setUpdatingOrder(orderId);
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(`${DOTNET_API_URL}/api/orders/${orderId}/priority?priority=${newPriority}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update priority: ${response.status}`);
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, priority: newPriority } : order
        )
      );
    } catch (err) {
      console.error('Error updating priority:', err);
      alert(`Failed to update priority: ${err.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-stone-800">Order Management</h3>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="rounded-full bg-yellow-400 px-4 py-2 font-semibold uppercase text-stone-800 transition-colors hover:bg-yellow-300 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-4 rounded-lg bg-stone-50 p-4">
        <p className="text-sm text-stone-600">
          <strong>Endpoint:</strong> <code className="text-xs bg-stone-200 px-2 py-1 rounded">{DOTNET_API_URL}/api/orders</code>
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 border border-red-300 p-4">
          <p className="font-semibold text-red-800">Error:</p>
          <p className="text-sm text-red-700">{error}</p>
          <p className="mt-2 text-xs text-red-600">
            Make sure your .NET API is running on port 5041 and CORS is configured to allow this origin.
          </p>
        </div>
      )}

      {isLoading && !error && (
        <div className="py-8 text-center text-stone-600">
          <div className="mb-2 text-4xl">⏳</div>
          <p>Loading orders...</p>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="py-8 text-center text-stone-600">
          <div className="mb-2 text-4xl">📭</div>
          <p>No orders found</p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order, index) => {
            // Parse the orderData JSON string
            let parsedOrderData = null;
            try {
              parsedOrderData = JSON.parse(order.orderData);
            } catch (e) {
              console.error('Failed to parse orderData:', e);
            }

            // Calculate total cost
            const orderPrice = parsedOrderData?.orderPrice || 0;
            const priorityPrice = parsedOrderData?.priorityPrice || 0;
            const totalCost = orderPrice + priorityPrice;

            const isExpanded = expandedOrderId === order.id;
            const isUpdating = updatingOrder === order.id;

            return (
              <div
                key={order.id || index}
                className={`rounded-lg border transition-all ${
                  isExpanded
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                {/* Main order card - clickable */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <p className="font-bold text-stone-800">
                          {order.id}
                        </p>
                        {order.priority && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                            PRIORITY
                          </span>
                        )}
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'in route' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'complete' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-stone-100 text-stone-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-stone-600">
                        <p>
                          <span className="font-semibold">User ID:</span>{' '}
                          <code className="text-xs bg-stone-100 px-1 py-0.5 rounded">
                            {order.userId}
                          </code>
                        </p>
                        <p>
                          <span className="font-semibold">Created:</span>{' '}
                          {getRelativeTime(order.createdAt)}
                        </p>
                        {parsedOrderData?.customer && (
                          <p>
                            <span className="font-semibold">Customer:</span>{' '}
                            {parsedOrderData.customer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-stone-800">
                        ${totalCost.toFixed(2)}
                      </p>
                      {parsedOrderData && (
                        <div className="mt-1 text-xs text-stone-500">
                          <p>Pizza: ${orderPrice.toFixed(2)}</p>
                          {priorityPrice > 0 && (
                            <p>Priority: +${priorityPrice.toFixed(2)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {parsedOrderData?.cart && (
                    <div className="mt-3 border-t border-stone-200 pt-3">
                      <p className="mb-1 text-xs font-semibold text-stone-700">
                        Items:
                      </p>
                      <div className="space-y-1">
                        {parsedOrderData.cart.map((item, i) => (
                          <p key={i} className="text-sm text-stone-600">
                            {item.quantity}x {item.name} - ${item.totalPrice}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded controls */}
                {isExpanded && (
                  <div className="border-t border-yellow-300 bg-white p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Status Control */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-stone-700">
                          Order Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['preparing', 'in route', 'complete', 'cancelled'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              disabled={isUpdating || order.status === status}
                              className={`rounded-lg px-3 py-2 text-sm font-semibold uppercase transition-colors ${
                                order.status === status
                                  ? 'bg-yellow-400 text-stone-800 cursor-default'
                                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-50'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Priority Control */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-stone-700">
                          Priority
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateOrderPriority(order.id, true)}
                            disabled={isUpdating || order.priority === true}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold uppercase transition-colors ${
                              order.priority === true
                                ? 'bg-red-500 text-white cursor-default'
                                : 'bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-50'
                            }`}
                          >
                            Priority
                          </button>
                          <button
                            onClick={() => updateOrderPriority(order.id, false)}
                            disabled={isUpdating || order.priority === false}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold uppercase transition-colors ${
                              order.priority === false
                                ? 'bg-stone-400 text-white cursor-default'
                                : 'bg-stone-200 text-stone-700 hover:bg-stone-300 disabled:opacity-50'
                            }`}
                          >
                            Standard
                          </button>
                        </div>
                      </div>
                    </div>

                    {isUpdating && (
                      <div className="mt-3 text-center text-sm text-stone-600">
                        Updating...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>📝 Note:</strong> This connects to an on-prem .NET API guarded by AWS Gateway.  Only employees who authenticate through AD will have the permissions necessary.
        </p>
      </div>
    </div>
  );
}

export default OrderManagement;
