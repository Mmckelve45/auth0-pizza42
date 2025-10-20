import { useSelector } from "react-redux";
import Toast from "./Toast";

function ToastContainer() {
  const toasts = useSelector((state) => state.toast.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default ToastContainer;
