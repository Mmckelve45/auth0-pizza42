// Use our own API instead of external restaurant API
import { getAccessToken } from './auth';

const API_URL = '/api';

/**
 * Get authorization headers with Auth0 token
 */
async function getAuthHeaders() {
  try {
    const token = await getAccessToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  } catch (error) {
    // User not authenticated, return headers without token
    return {
      'Content-Type': 'application/json',
    };
  }
}

export async function getMenu() {
  const res = await fetch(`${API_URL}/menu`);

  // fetch won't throw error on 400 errors (e.g. when URL is wrong), so we need to do it manually. This will then go into the catch block, where the message is set
  if (!res.ok) throw Error('Failed getting menu');

  const { data } = await res.json();
  return data;
}

export async function getOrder(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/orders/${id}`, { headers });

  if (!res.ok) {
    throw Error(`Couldn't find order #${id}`);
  }

  const { data } = await res.json();
  return data;
}

export async function createOrder(newOrder) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(newOrder),
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.error || 'Failed creating your order');
      error.statusCode = res.status;
      error.details = errorData.details;
      error.requiresEmailVerification = errorData.requiresEmailVerification;
      throw error;
    }
    const { data } = await res.json();
    return data;
  } catch (error) {
    // Re-throw the error with status code if it exists
    if (error.statusCode) {
      throw error;
    }
    // Otherwise create a new error with unknown status
    const newError = new Error(error.message || 'Failed creating your order');
    newError.statusCode = 500;
    throw newError;
  }
}

export async function updateOrder(id, updateObj) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateObj),
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.error || 'Failed updating your order');
      error.statusCode = res.status;
      error.details = errorData.details;
      throw error;
    }
    // We don't need the data, so we don't return anything
  } catch (error) {
    // Re-throw the error with status code if it exists
    if (error.statusCode) {
      throw error;
    }
    // Otherwise create a new error with unknown status
    const newError = new Error(error.message || 'Failed updating your order');
    newError.statusCode = 500;
    throw newError;
  }
}
