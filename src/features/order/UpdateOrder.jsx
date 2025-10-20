import { useFetcher } from "react-router-dom";
import { updateOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import store from "../../store";
import { addToast } from "../toast/toastSlice";

// eslint-disable-next-line react/prop-types
export default function UpdateOrder({ order }) {
  const fetcher = useFetcher();

  console.log(order);
  return (
    <fetcher.Form method="PATCH" className="text-right">
      <Button type="primary">Make priority</Button>
    </fetcher.Form>
  );
}

// eslint-disable-next-line no-unused-vars
export async function action({ request, params }) {
  try {
    const data = { priority: true };
    await updateOrder(params.orderId, data);

    // Show success toast
    store.dispatch(
      addToast({
        message: "Order updated successfully!",
        type: "success",
        duration: 3000,
      })
    );

    return null;
  } catch (error) {
    // Show error toast
    store.dispatch(
      addToast({
        message: error.message || "Failed to update order",
        type: "error",
        statusCode: error.statusCode || 500,
        duration: 5000,
      })
    );

    return null;
  }
}
