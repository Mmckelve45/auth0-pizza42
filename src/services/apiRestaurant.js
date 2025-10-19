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
  if (!res.ok) throw Error(`Couldn't find order #${id}`);

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

    if (!res.ok) throw Error();
    const { data } = await res.json();
    return data;
  } catch {
    throw Error('Failed creating your order');
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

    if (!res.ok) throw Error();
    // We don't need the data, so we don't return anything
  } catch (err) {
    throw Error('Failed updating your order');
  }
}
