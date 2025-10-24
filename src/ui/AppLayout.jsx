import CartOverview from "../features/cart/CartOverview";
import Header from "./Header";
import { Outlet, useNavigation } from "react-router-dom";
import Loader from "./Loader";
import ToastContainer from "../features/toast/ToastContainer";
import AccountLinkingDetector from "../features/account-linking/AccountLinkingDetector";

export default function AppLayout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="grid h-screen grid-rows-[auto_1fr_auto]">
      {isLoading && <Loader />}
      <Header />
      <div className="overflow-scroll">
        <main className="mx-auto max-w-3xl ">
          <Outlet />
        </main>
      </div>
      <CartOverview />
      <ToastContainer />
      <AccountLinkingDetector />
    </div>
  );
}
