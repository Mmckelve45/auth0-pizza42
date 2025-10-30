/**
 * Inventory Management Component
 * Fetches and displays pizzas from .NET API
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ALL_SCOPES } from '../../config/auth0-config';

const DOTNET_API_URL = import.meta.env.VITE_DOTNET_API_URL || 'http://localhost:5041';

function InventoryManagement() {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();
  const [pizzas, setPizzas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPizzaId, setEditingPizzaId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [updatingPizza, setUpdatingPizza] = useState(null);
  const [hasUpdatePizzaScope, setHasUpdatePizzaScope] = useState(null);

  /**
   * Check if user has update:pizza scope, request via MFA if not
   * @returns {Promise<string|null>} Token with ALL scopes including update:pizza, or null if needs re-auth
   */
  const ensureUpdatePizzaScope = async () => {
    try {
      // Try to get token with ALL scopes (including update:pizza)
      // This ensures we don't lose existing scopes
      const token = await getAccessTokenSilently({
        authorizationParams: {
          scope: ALL_SCOPES,
        },
      });
      return token;
    } catch (error) {
      console.log('update:pizza scope not available, triggering step-up MFA');

      // Save current path to localStorage before redirecting
      localStorage.setItem('auth0_returnTo', window.location.pathname);

      // Trigger login to request ALL scopes (will trigger MFA via Action when it sees update:pizza)
      await loginWithRedirect({
        authorizationParams: {
          scope: ALL_SCOPES,
          // prompt: 'login', // Force re-authentication
        },
        appState: {
          returnTo: window.location.pathname, // Return to inventory tab
        },
      });

      return null; // Will redirect, so this won't be reached
    }
  };

  const checkUpdatePizzaScope = useCallback(async () => {
    try {
      // Try to get token with ALL scopes (including update:pizza)
      await getAccessTokenSilently({
        authorizationParams: {
          scope: ALL_SCOPES,
        },
      });
      // If successful, user has the scope
      setHasUpdatePizzaScope(true);
    } catch (error) {
      // If failed, user doesn't have the scope yet
      setHasUpdatePizzaScope(false);
    }
  }, [getAccessTokenSilently]);

  const fetchPizzas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get Auth0 access token (read-only, no special scope needed)
      const token = await getAccessTokenSilently();

      const response = await fetch(`${DOTNET_API_URL}/api/pizzas`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pizzas: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setPizzas(data);
    } catch (err) {
      console.error('Error fetching pizzas:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessTokenSilently]);

  const updatePizzaPrice = async (pizzaId, unitPrice) => {
    setUpdatingPizza(pizzaId);
    try {
      // Check for update:pizza scope, trigger MFA if needed
      const token = await ensureUpdatePizzaScope();

      if (!token) {
        // User will be redirected for MFA, so just return
        return;
      }

      // Update scope status (user now has the scope)
      setHasUpdatePizzaScope(true);

      const response = await fetch(`${DOTNET_API_URL}/api/pizzas/${pizzaId}/price?newPrice=${unitPrice}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update price: ${response.status}`);
      }

      // Update local state
      setPizzas((prevPizzas) =>
        prevPizzas.map((pizza) =>
          pizza.id === pizzaId ? { ...pizza, unitPrice: parseFloat(unitPrice) } : pizza
        )
      );

      // Close edit mode
      setEditingPizzaId(null);
      setNewPrice('');
    } catch (err) {
      console.error('Error updating price:', err);
      alert(`Failed to update price: ${err.message}`);
    } finally {
      setUpdatingPizza(null);
    }
  };

  const toggleSoldOut = async (pizzaId, currentSoldOut) => {
    const newSoldOut = !currentSoldOut;
    setUpdatingPizza(pizzaId);
    try {
      // Check for update:pizza scope, trigger MFA if needed
      const token = await ensureUpdatePizzaScope();

      if (!token) {
        // User will be redirected for MFA, so just return
        setUpdatingPizza(null);
        return;
      }

      const response = await fetch(`${DOTNET_API_URL}/api/pizzas/${pizzaId}/soldout?soldOut=${newSoldOut}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update sold out status: ${response.status}`);
      }

      // Update local state
      setPizzas((prevPizzas) =>
        prevPizzas.map((pizza) =>
          pizza.id === pizzaId ? { ...pizza, soldOut: newSoldOut } : pizza
        )
      );
    } catch (err) {
      console.error('Error updating sold out status:', err);
      alert(`Failed to update sold out status: ${err.message}`);
    } finally {
      setUpdatingPizza(null);
    }
  };

  const handleEditClick = (pizza) => {
    setEditingPizzaId(pizza.id);
    setNewPrice(pizza.unitPrice?.toString() || pizza.price?.toString() || '0');
  };

  const handleCancelEdit = () => {
    setEditingPizzaId(null);
    setNewPrice('');
  };

  const handleSavePrice = (pizzaId) => {
    const price = parseFloat(newPrice);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price');
      return;
    }
    updatePizzaPrice(pizzaId, price);
  };

  useEffect(() => {
    fetchPizzas();
    checkUpdatePizzaScope();
  }, [fetchPizzas, checkUpdatePizzaScope]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-stone-800">Inventory Management</h3>
        <button
          onClick={fetchPizzas}
          disabled={isLoading}
          className="rounded-full bg-yellow-400 px-4 py-2 font-semibold uppercase text-stone-800 transition-colors hover:bg-yellow-300 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-4 rounded-lg bg-stone-50 p-4">
        <p className="text-sm text-stone-600">
          <strong>Endpoint:</strong> <code className="text-xs bg-stone-200 px-2 py-1 rounded">{DOTNET_API_URL}/api/pizzas</code>
        </p>
      </div>

      {/* Scope Status Indicator */}
      <div className="mb-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          <h4 className="font-bold text-purple-900">Authorization Scopes</h4>
        </div>

        <div className="space-y-2">
          {/* Required Scope */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span className="font-semibold text-stone-800">Required for Updates:</span>
              </div>
              <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase text-white">
                Required
              </span>
            </div>
            <code className="text-sm font-mono text-purple-700 bg-purple-100 px-2 py-1 rounded">
              update:pizza
            </code>
            <p className="mt-2 text-xs text-stone-600">
              ⚠️ Editing prices or sold-out status requires this scope (MFA protected)
            </p>
          </div>

          {/* Current Status */}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="font-semibold text-stone-800">Your Current Status:</span>
              </div>
              {hasUpdatePizzaScope === null ? (
                <span className="rounded-full bg-stone-300 px-3 py-1 text-xs font-bold uppercase text-stone-700">
                  Checking...
                </span>
              ) : hasUpdatePizzaScope ? (
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold uppercase text-white flex items-center gap-1">
                  ✓ Granted
                </span>
              ) : (
                <span className="rounded-full bg-yellow-600 px-3 py-1 text-xs font-bold uppercase text-white flex items-center gap-1">
                  ⚠ Not Yet
                </span>
              )}
            </div>
            {hasUpdatePizzaScope === true ? (
              <p className="text-sm text-green-700">
                ✅ You have completed MFA and can edit pizzas
              </p>
            ) : hasUpdatePizzaScope === false ? (
              <p className="text-sm text-yellow-700">
                🔒 Edit a pizza to trigger step-up MFA authentication
              </p>
            ) : (
              <p className="text-sm text-stone-600">
                Checking your permissions...
              </p>
            )}
          </div>
        </div>
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
          <p>Loading inventory...</p>
        </div>
      )}

      {!isLoading && !error && pizzas.length === 0 && (
        <div className="py-8 text-center text-stone-600">
          <div className="mb-2 text-4xl">🍕</div>
          <p>No pizzas found in inventory</p>
        </div>
      )}

      {!isLoading && !error && pizzas.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pizzas.map((pizza, index) => {
            const isEditing = editingPizzaId === pizza.id;
            const isUpdating = updatingPizza === pizza.id;
            const displayPrice = pizza.unitPrice ?? pizza.price ?? 0;

            return (
              <div
                key={pizza.id || index}
                className={`rounded-lg border p-4 transition-all ${
                  isEditing
                    ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                    : 'border-stone-200 hover:shadow-md'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="font-bold text-stone-800">
                    {pizza.name || pizza.pizzaName || `Pizza ${index + 1}`}
                  </h4>
                  <span className="text-2xl">🍕</span>
                </div>

                {pizza.description && (
                  <p className="mb-3 text-sm text-stone-600">{pizza.description}</p>
                )}

                {/* Sold Out Toggle */}
                {pizza.soldOut !== undefined && (
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-stone-100 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-700">
                        Sold Out
                      </span>
                      <span className={`text-xs font-bold uppercase ${
                        pizza.soldOut ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {pizza.soldOut ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleSoldOut(pizza.id, pizza.soldOut)}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 ${
                        pizza.soldOut ? 'bg-red-600' : 'bg-green-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          pizza.soldOut ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Unit Price - Prominent Display */}
                <div className="mb-3 rounded-lg bg-green-50 p-3 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-800">Unit Price:</span>
                    <span className="text-2xl font-bold text-green-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {pizza.stock !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Stock:</span>
                      <span className={`font-semibold ${
                        pizza.stock > 10 ? 'text-green-600' :
                        pizza.stock > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {pizza.stock} units
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit Controls */}
                {!isEditing ? (
                  <button
                    onClick={() => handleEditClick(pizza)}
                    className="w-full rounded-lg bg-stone-700 px-4 py-2 text-sm font-semibold uppercase text-yellow-400 transition-colors hover:bg-stone-600"
                  >
                    Edit Price
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-stone-700">
                        New Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        disabled={isUpdating}
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-stone-100"
                        placeholder="Enter new price"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSavePrice(pizza.id)}
                        disabled={isUpdating}
                        className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold uppercase text-white transition-colors hover:bg-green-700 disabled:bg-stone-300"
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="flex-1 rounded-lg bg-stone-300 px-3 py-2 text-sm font-semibold uppercase text-stone-700 transition-colors hover:bg-stone-400 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
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

export default InventoryManagement;
