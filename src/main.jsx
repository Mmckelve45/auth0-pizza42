import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import "./index.css";
import store from "./store.js";
import { auth0Config } from "./config/auth0-config.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      cacheLocation={auth0Config.cacheLocation}
      useRefreshTokens={auth0Config.useRefreshTokens}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </Auth0Provider>
  </React.StrictMode>,
);
