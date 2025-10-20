// import { useState } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, redirect, useNavigation, useActionData } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { createOrder } from "../../services/apiRestaurant";
import store from "../../store";
import Button from "../../ui/Button";
import { formatCurrency } from "../../utils/helpers";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import { fetchAddress } from "../user/userSlice";
import { getStoredMetadata } from "../../utils/userMetadata";
import { addToast } from "../toast/toastSlice";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str,
  );

function CreateOrder() {
  const {
    username,
    status: addressStatus,
    position,
    address,
    error: errorAddress,
  } = useSelector((state) => state.user);

  const { user, getAccessTokenSilently } = useAuth0();
  const isLoadingAddress = addressStatus === "loading";
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [withPriority, setWithPriority] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;
  const formErrors = useActionData();
  const dispatch = useDispatch();

  // Check if email verification is required
  const requiresEmailVerification = formErrors?.requiresEmailVerification && !emailVerified;

  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    try {
      // Force token refresh to get updated user claims
      await getAccessTokenSilently({ cacheMode: 'off' });

      // Check the current user object from Auth0 SDK
      if (user?.email_verified) {
        setEmailVerified(true);
        dispatch(addToast({
          type: 'success',
          message: 'Email verified successfully! You can now place your order.',
          duration: 5000,
        }));
      } else {
        // Email not verified yet, ask them to try again
        dispatch(addToast({
          type: 'warning',
          message: 'Email not verified yet. Please click the link in your email and try again.',
          duration: 5000,
        }));
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      dispatch(addToast({
        type: 'error',
        message: 'Failed to check verification status. Please try again.',
        duration: 5000,
      }));
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // Get metadata from localStorage
  const metadata = getStoredMetadata();
  const defaultName = metadata?.fullName || username;
  const defaultAddress = metadata?.address?.formatted || address;

  if (!cart.length) return <EmptyCart />;

  return (
    <div className="py-6 px-4">
      <h2 className="text-xl font-semibold mb-8">Ready to order? Lets go!</h2>

      {/* <Form method='POST' action='/order/new'> */}
      <Form method="POST">
        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center">
          <label className="sm:basis-40">Full Name</label>
          <input
            type="text"
            name="customer"
            required
            className="input grow"
            defaultValue={defaultName}
          />
        </div>

        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input type="tel" name="phone" required className="input w-full" />
            {formErrors?.phone && (
              <p className="text-xs mt-2 text-red-700 bg-red-100 p-2 rounded-md">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center relative">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input
              type="text"
              name="address"
              disabled={isLoadingAddress}
              defaultValue={defaultAddress}
              required
              className="input w-full"
            />
            {addressStatus === "error" && (
              <p className="text-xs mt-2 text-red-700 bg-red-100 p-2 rounded-md">
                {errorAddress}
              </p>
            )}
          </div>
          {!position.latitude && !position.longitude && (
            <span className="absolute right-[3px] z-50 top-[3px] md:right-[5px] md:top-[5px]">
              <Button
                disabled={isLoadingAddress}
                type="small"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchAddress());
                }}
              >
                Get Position
              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex gap-5 items-center">
          <input
            type="checkbox"
            name="priority"
            id="priority"
            className="h-6 w-6 accent-yellow-400
             focus:outline-none 
             focus:ring focus:ring-yellow-400 focus:ring-offset-2 "
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">
            Want to give your order priority?
          </label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)} />
          <input
            type="hidden"
            name="position"
            value={
              position.longitude && position.latitude
                ? `${position.latitude}, ${position.longitude}`
                : ""
            }
          />
          {requiresEmailVerification && user?.email && (
            <div className="mb-4">
              <p className="mb-2 text-xs text-stone-600">
                We have sent an email to <strong>{user.email}</strong>. Please check your inbox to proceed with your order.
              </p>
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={isCheckingVerification}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
              >
                {isCheckingVerification ? 'Checking...' : 'Confirm Email Verification'}
              </button>
            </div>
          )}
          <Button type="primary" disabled={isSubmitting || isLoadingAddress || requiresEmailVerification}>
            {isSubmitting
              ? "Placing Order..."
              : `Order now for ${formatCurrency(totalPrice)}`}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  };
  const errors = {};
  if (!isValidPhone(order.phone)) {
    errors.phone =
      "Please give us your correct phone number.  We might need it to contact you.";
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  // If everything is ok, create new order and redirect.
  try {
    const newOrder = await createOrder(order);
    // Do not overuse here.
    store.dispatch(clearCart());

    return redirect(`/order/${newOrder.id}`);
  } catch (error) {
    // Dispatch toast notification with status code and error message
    store.dispatch(
      addToast({
        message: error.message || "Failed creating your order",
        type: "error",
        statusCode: error.statusCode || 500,
        duration: 7000,
      })
    );

    // Return errors to keep the form data
    return {
      orderError: error.message || "Failed creating your order",
      requiresEmailVerification: error.requiresEmailVerification || false,
    };
  }
}

export default CreateOrder;
