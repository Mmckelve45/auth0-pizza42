/**
 * Employee Portal
 * Landing page for employees with Employee role
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsEmployee, useAuthUser } from '../auth/useAuthHelpers';
import { Navigate } from 'react-router-dom';
import OrderManagement from './OrderManagement';
import InventoryManagement from './InventoryManagement';

function EmployeePortal() {
  const isEmployee = useIsEmployee();
  const { user } = useAuthUser();
  const [activeTab, setActiveTab] = useState('orders');

  // Redirect non-employees to home
  if (!isEmployee) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-stone-800">
          Employee Portal
        </h1>
        <p className="text-lg text-stone-600">
          Welcome back, {user?.name || 'Employee'}!
        </p>
      </div>

      {/* Info Card */}
      <div className="mb-6 rounded-lg bg-yellow-100 p-6 shadow-md">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">👔</span>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">
              Pizza42 Staff Dashboard
            </h2>
            <p className="text-stone-600">
              Connected to .NET API on port 5041
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-stone-700">
            Your Role:
          </p>
          <span className="inline-block rounded-full bg-yellow-400 px-4 py-2 font-bold uppercase tracking-wide text-stone-800">
            Employee
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 border-b border-stone-300">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'border-b-4 border-yellow-400 text-stone-800'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            📊 Order Management
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'inventory'
                ? 'border-b-4 border-yellow-400 text-stone-800'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            📦 Inventory Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'inventory' && <InventoryManagement />}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Link
          to="/"
          className="flex-1 rounded-full bg-yellow-400 px-6 py-3 text-center font-semibold uppercase tracking-wide text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
        >
          Back to Main App
        </Link>
      </div>
    </div>
  );
}

export default EmployeePortal;
