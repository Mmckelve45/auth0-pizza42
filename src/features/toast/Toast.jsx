/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeToast } from "./toastSlice";

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  const handleClose = () => {
    dispatch(removeToast(toast.id));
  };

  const typeStyles = {
    error: "bg-red-500 border-red-700",
    success: "bg-green-500 border-green-700",
    warning: "bg-yellow-500 border-yellow-700",
    info: "bg-blue-500 border-blue-700",
  };

  return (
    <div
      className={`${typeStyles[toast.type] || typeStyles.error} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-start gap-3 min-w-[300px] max-w-[500px] animate-slide-in`}
    >
      <div className="flex-1">
        {toast.statusCode && (
          <div className="font-bold text-sm mb-1">
            Status Code: {toast.statusCode}
          </div>
        )}
        <div className="text-sm">{toast.message}</div>
      </div>
      <button
        onClick={handleClose}
        className="text-white hover:text-gray-200 font-bold text-xl leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
