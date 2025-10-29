import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { setAuth0Client } from "./services/auth";
import Home from "./ui/Home";
import Menu, { loader as menuLoader } from "./features/menu/Menu";
import Cart from "./features/cart/Cart";
import Order, { loader as orderLoader } from "./features/order/Order";
import CreateOrder, {
  action as createOrderAction,
} from "./features/order/CreateOrder";
import AppLayout from "./ui/AppLayout";
import Error from "./ui/Error";
import Profile from "./features/auth/Profile";
import EmployeePortal from "./features/employee/EmployeePortal";
import { action as updateOrderAction } from "./features/order/UpdateOrder";

const router = createBrowserRouter([
  {
    // No path is called layout route
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/menu",
        element: <Menu />,
        loader: menuLoader,
        errorElement: <Error />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order/new",
        element: <CreateOrder />,
        action: createOrderAction,
      },
      {
        path: "/order/:orderId",
        element: <Order />,
        loader: orderLoader,
        errorElement: <Error />,
        action: updateOrderAction,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/employee",
        element: <EmployeePortal />,
      },
    ],
  },
]);

// Wrapper component to initialize Auth0 client
function AppWithAuth() {
  const auth0 = useAuth0();

  useEffect(() => {
    // Store the Auth0 client globally so it can be used in non-React code
    setAuth0Client(auth0);
  }, [auth0]);

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AppWithAuth />;
}
