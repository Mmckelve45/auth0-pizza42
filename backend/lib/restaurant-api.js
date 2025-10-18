/**
 * Restaurant API wrapper
 * Proxies requests to the external pizza restaurant API
 */

const RESTAURANT_API_URL = process.env.RESTAURANT_API_URL || 'https://react-fast-pizza-api.onrender.com/api';

export const getMenu = async () => {
  try {
    const response = await fetch(`${RESTAURANT_API_URL}/menu`);
    if (!response.ok) {
      throw new Error(`Restaurant API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

export const getOrder = async (orderId) => {
  try {
    const response = await fetch(`${RESTAURANT_API_URL}/order/${orderId}`);
    if (!response.ok) {
      throw new Error(`Restaurant API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${RESTAURANT_API_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      throw new Error(`Restaurant API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (orderId, updateData) => {
  try {
    const response = await fetch(`${RESTAURANT_API_URL}/order/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Restaurant API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};
