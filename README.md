# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

Dependencies:
npm i eslint vite-plugin-eslint eslint-config-react --save-dev

create eslintrc.json for rules
{
"extends": "react-app"
}

Be sure to have eslint extension in vsCode

Add eslint to vite.config.js
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
plugins: [react(), eslint()],
});

install tailwind (see their docs)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

install VS Code extension for tailwind (gives autocompletion)

install Tailwind Prettier extension (github link from search)

npm install -D prettier prettier-plugin-tailwindcss
// prettier.config.cjs
module.exports = {
plugins: ['prettier-plugin-tailwindcss'],
}

Questions:

1. Gather requirements and features
2. Divide the application into pages
3. - Overall page-level UI
4. - break desired UI into components
5. - Design and build static version (no state)
6. Divide the application into feature categories
7. - Think a bout statemanagement and data flow
8. Decide on which libraries to use

Requirements

1. Users can order one or more pizas from menu
2. Requires no user accounts and no logins: users just input their name
3. The pizza menu can change, so it should be loaded from an API.
4. Ordering requries the user's name, phone number, and address
5. If Possible, GPS location should also be provided to make delivery easier.
6. Use's can mark their order as 'priority' for 20% upcharge
7. Orders are made by sending a POST request with teh order data (user data + selected pizzas) to the API.
8. Payments are made on delivery, so no payment processing in the app
9. Each new order gets unique ID that should be displayed, so the user can later look up the status of their order based on ID.
10. Users should be able to mark their order as priority even after it's been placed.

Features

1. User
2. Menu
3. Cart
4. Order

Page

1. Homepage /
2. Pizza Menu /menu
3. Cart /cart
4. Placing a new order /order/new
5. Looking up an order /order/:orderID

State

1. User > Global UI state (no accounts, so stays in app)
2. Menu > Global remote state (menu is fetched from API)
3. Cart > Global UI state (no need for API, just stored in app)
4. Order > Global Remote State (fetched and submitted to API)

Tech choices

1. Routing > React Router
2. Styling > TailwindCSS
3. Remote State Management > React Router
4. UI State Management > Redux
