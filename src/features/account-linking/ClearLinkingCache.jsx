/**
 * Clear Linking Cache Button
 * Small utility button to reset account linking sessionStorage for demo purposes
 */

import { useState } from 'react';

function ClearLinkingCache() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClear = () => {
    // Clear all linking-related sessionStorage keys
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith('linking_checked_') || key.startsWith('linking_dismissed_')) {
        sessionStorage.removeItem(key);
      }
    });

    // Show feedback
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleClear}
        className="rounded-full bg-stone-700 px-3 py-2 text-xs font-semibold text-yellow-400 shadow-lg transition-all hover:bg-stone-600 hover:shadow-xl"
        title="Clear account linking cache (for demo)"
      >
        🔄 Reset Link Check
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          ✓ Linking cache cleared!
        </div>
      )}
    </div>
  );
}

export default ClearLinkingCache;
